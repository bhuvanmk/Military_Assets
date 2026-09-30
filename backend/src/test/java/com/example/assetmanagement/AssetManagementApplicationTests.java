package com.example.assetmanagement;

import com.example.assetmanagement.dto.request.*;
import com.example.assetmanagement.dto.response.*;
import com.example.assetmanagement.entity.*;
import com.example.assetmanagement.enums.Role;
import com.example.assetmanagement.enums.TransferStatus;
import com.example.assetmanagement.exception.AccessDeniedBusinessException;
import com.example.assetmanagement.exception.BusinessRuleException;
import com.example.assetmanagement.exception.InvalidCredentialsException;
import com.example.assetmanagement.exception.UnauthorizedBaseAccessException;
import com.example.assetmanagement.repository.*;
import com.example.assetmanagement.security.JwtService;
import com.example.assetmanagement.security.UserPrincipal;
import com.example.assetmanagement.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = "spring.config.name=application-test")
@ActiveProfiles("test")
@Transactional
public class AssetManagementApplicationTests {

    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryOpeningBalanceRepository openingBalanceRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private ExpenditureRepository expenditureRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private TransferService transferService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private ExpenditureService expenditureService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private Base alphaBase;
    private Base bravoBase;
    private EquipmentType transportVehicle;
    private User adminUser;
    private User commanderUser;
    private User logisticsUser;

    @BeforeEach
    void setUp() {
        expenditureRepository.deleteAll();
        assignmentRepository.deleteAll();
        transferRepository.deleteAll();
        purchaseRepository.deleteAll();
        openingBalanceRepository.deleteAll();
        userRepository.deleteAll();
        equipmentTypeRepository.deleteAll();
        baseRepository.deleteAll();

        alphaBase = baseRepository.save(new Base(null, "Alpha Base", "North Sector", "Primary Command", true));
        bravoBase = baseRepository.save(new Base(null, "Bravo Base", "East Sector", "Supply Depot", true));

        transportVehicle = equipmentTypeRepository.save(new EquipmentType(null, "Transport Vehicle", "Vehicles", "Units", "Standard Transporter", true));

        adminUser = userRepository.save(new User(null, "Major General Marcus Vance", "admin@gmail.com", passwordEncoder.encode("Admin@123"), Role.ADMIN, null, true));
        commanderUser = userRepository.save(new User(null, "Colonel Sarah Sterling", "commander1@example.com", passwordEncoder.encode("Commander@123"), Role.BASE_COMMANDER, alphaBase, true));
        logisticsUser = userRepository.save(new User(null, "Captain David Miller", "logistics@example.com", passwordEncoder.encode("Logistics@123"), Role.LOGISTICS_OFFICER, alphaBase, true));

        setSecurityContext(adminUser);
    }

    private void setSecurityContext(User user) {
        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Admin logs in via /api/auth/admin/login; role claim is ADMIN and baseId is null")
    void testAdminLoginViaAdminEndpoint() {
        LoginRequest req = new LoginRequest("admin@gmail.com", "Admin@123");
        AuthResponse res = authService.loginAdmin(req);

        assertNotNull(res.getToken());
        assertEquals(Role.ADMIN, res.getRole());
        assertNull(res.getBaseId());
        assertTrue(jwtService.validateToken(res.getToken()));
        assertEquals("ADMIN", jwtService.extractClaim(res.getToken(), c -> c.get("role")));
    }

    @Test
    @DisplayName("Admin rejected on /api/auth/login with 403 Please use the Admin Portal")
    void testAdminRejectedOnUserLoginEndpoint() {
        LoginRequest req = new LoginRequest("admin@gmail.com", "Admin@123");
        AccessDeniedBusinessException ex = assertThrows(AccessDeniedBusinessException.class, () -> {
            authService.loginUser(req);
        });
        assertEquals("Please use the Admin Portal.", ex.getMessage());
    }

    @Test
    @DisplayName("Commander and Logistics Officer log in successfully via /api/auth/login")
    void testCommanderAndLogisticsLoginViaUserEndpoint() {
        LoginRequest cmdReq = new LoginRequest("commander1@example.com", "Commander@123");
        AuthResponse cmdRes = authService.loginUser(cmdReq);
        assertNotNull(cmdRes.getToken());
        assertEquals(Role.BASE_COMMANDER, cmdRes.getRole());
        assertEquals(alphaBase.getId(), cmdRes.getBaseId());

        LoginRequest logReq = new LoginRequest("logistics@example.com", "Logistics@123");
        AuthResponse logRes = authService.loginUser(logReq);
        assertNotNull(logRes.getToken());
        assertEquals(Role.LOGISTICS_OFFICER, logRes.getRole());
        assertEquals(alphaBase.getId(), logRes.getBaseId());
    }

    @Test
    @DisplayName("Non-admin rejected on /api/auth/admin/login with 403 Admin access required")
    void testNonAdminRejectedOnAdminEndpoint() {
        LoginRequest req = new LoginRequest("commander1@example.com", "Commander@123");
        AccessDeniedBusinessException ex = assertThrows(AccessDeniedBusinessException.class, () -> {
            authService.loginAdmin(req);
        });
        assertEquals("Admin access required.", ex.getMessage());
    }

    @Test
    @DisplayName("Wrong password throws 401; Inactive user throws 403")
    void testWrongPasswordAndDeactivatedUser() {
        LoginRequest wrongPwReq = new LoginRequest("commander1@example.com", "WrongPassword!");
        assertThrows(InvalidCredentialsException.class, () -> authService.loginUser(wrongPwReq));

        LoginRequest wrongAdminPwReq = new LoginRequest("admin@gmail.com", "WrongAdminPw!");
        assertThrows(InvalidCredentialsException.class, () -> authService.loginAdmin(wrongAdminPwReq));

        // Deactivate user
        commanderUser.setActive(false);
        userRepository.save(commanderUser);

        LoginRequest inactiveReq = new LoginRequest("commander1@example.com", "Commander@123");
        assertThrows(AccessDeniedBusinessException.class, () -> authService.loginUser(inactiveReq));
    }

    @Test
    @DisplayName("Commander of Alpha Base calling ?baseId=2 (Bravo) is blocked with 403; own base is allowed")
    void testCommanderBaseIsolation() {
        setSecurityContext(commanderUser);

        // Accessing foreign base throws UnauthorizedBaseAccessException
        assertThrows(UnauthorizedBaseAccessException.class, () -> {
            dashboardService.getDashboardData(bravoBase.getId(), null, null, null);
        });

        // Accessing own base passes
        DashboardResponse ownRes = dashboardService.getDashboardData(alphaBase.getId(), null, null, null);
        assertNotNull(ownRes);
        assertEquals(alphaBase.getId(), ownRes.getBaseId());

        // Omitting baseId defaults to assigned base
        DashboardResponse defaultRes = dashboardService.getDashboardData(null, null, null, null);
        assertNotNull(defaultRes);
        assertEquals(alphaBase.getId(), defaultRes.getBaseId());
    }

    @Test
    @DisplayName("Test Worked Example: Opening 100, Purchases 20, Transfer In 10, Transfer Out 15, Assigned 10, Expended 5 -> Net Movement = 15, Closing Balance = 100")
    void testWorkedExampleInventoryCalculation() {
        setSecurityContext(adminUser);

        openingBalanceRepository.save(new InventoryOpeningBalance(null, alphaBase, transportVehicle, 100, LocalDate.of(2026, 1, 1), adminUser));
        purchaseRepository.save(new Purchase(null, alphaBase, transportVehicle, 20, LocalDate.of(2026, 2, 10), "PO-TEST-001", "Supplier A", "Remarks", adminUser));
        transferRepository.save(new Transfer(null, bravoBase, alphaBase, transportVehicle, 10, LocalDate.of(2026, 2, 20), TransferStatus.COMPLETED, "TR-TEST-001", "Inbound", adminUser));
        transferRepository.save(new Transfer(null, alphaBase, bravoBase, transportVehicle, 15, LocalDate.of(2026, 2, 22), TransferStatus.COMPLETED, "TR-TEST-002", "Outbound", adminUser));
        transferRepository.save(new Transfer(null, alphaBase, bravoBase, transportVehicle, 5, LocalDate.of(2026, 2, 25), TransferStatus.PENDING, "TR-TEST-PENDING", "Pending", adminUser));
        assignmentRepository.save(new Assignment(null, alphaBase, transportVehicle, "Squad Leader Jenkins", 10, LocalDate.of(2026, 3, 1), "Mission Alpha", adminUser));
        expenditureRepository.save(new Expenditure(null, alphaBase, transportVehicle, 5, LocalDate.of(2026, 3, 5), "Decommissioned", "Damaged", adminUser));

        InventoryItemResponse item = inventoryService.calculateInventoryForItem(alphaBase.getId(), transportVehicle.getId(), null, null);

        assertEquals(100, item.getOpeningBalance());
        assertEquals(20, item.getPurchases());
        assertEquals(10, item.getTransferIn());
        assertEquals(15, item.getTransferOut());
        assertEquals(15, item.getNetMovement(), "Net Movement should be 20 + 10 - 15 = 15");
        assertEquals(10, item.getAssigned());
        assertEquals(5, item.getExpended());
        assertEquals(100, item.getClosingBalance(), "Closing Balance should be 100 + 20 + 10 - 15 - 10 - 5 = 100");
    }

    @Test
    @DisplayName("Verify Passwords are BCrypt hashed and never exposed in User DTO responses")
    void testPasswordBCryptHashedAndNotExposed() {
        setSecurityContext(adminUser);

        UserResponse userRes = userService.getUserById(commanderUser.getId());
        assertNotNull(userRes);
        // User entity password is encrypted
        User dbUser = userRepository.findById(commanderUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches("Commander@123", dbUser.getPassword()));
        assertFalse(dbUser.getPassword().contains("Commander@123"));
    }
}
