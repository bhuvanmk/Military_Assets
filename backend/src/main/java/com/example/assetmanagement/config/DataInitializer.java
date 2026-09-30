package com.example.assetmanagement.config;

import com.example.assetmanagement.entity.Base;
import com.example.assetmanagement.entity.EquipmentType;
import com.example.assetmanagement.entity.InventoryOpeningBalance;
import com.example.assetmanagement.entity.User;
import com.example.assetmanagement.enums.Role;
import com.example.assetmanagement.repository.BaseRepository;
import com.example.assetmanagement.repository.EquipmentTypeRepository;
import com.example.assetmanagement.repository.InventoryOpeningBalanceRepository;
import com.example.assetmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final InventoryOpeningBalanceRepository openingBalanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    public DataInitializer(
            UserRepository userRepository,
            BaseRepository baseRepository,
            EquipmentTypeRepository equipmentTypeRepository,
            InventoryOpeningBalanceRepository openingBalanceRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.openingBalanceRepository = openingBalanceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }

        // 1. Remove obsolete demo accounts if present
        userRepository.findByEmail("admin@example.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("commander@example.com").ifPresent(userRepository::delete);

        // 2. Ensure Bases exist
        Base alpha = baseRepository.findByName("Alpha Base").orElseGet(() ->
                baseRepository.save(new Base(null, "Alpha Base", "Sector 4 - Northern Command", "Primary logistical hub", true)));
        Base bravo = baseRepository.findByName("Bravo Base").orElseGet(() ->
                baseRepository.save(new Base(null, "Bravo Base", "Sector 9 - Eastern Outpost", "Tactical supply depot", true)));
        Base charlie = baseRepository.findByName("Charlie Base").orElseGet(() ->
                baseRepository.save(new Base(null, "Charlie Base", "Sector 2 - Southern Perimeter", "Maritime surveillance", true)));

        // 3. Ensure Equipment Types exist
        EquipmentType transport = equipmentTypeRepository.findByName("Transport Vehicle").orElseGet(() ->
                equipmentTypeRepository.save(new EquipmentType(null, "Transport Vehicle", "Vehicles", "Units", "Heavy duty transporter", true)));
        EquipmentType utility = equipmentTypeRepository.findByName("Utility Vehicle").orElseGet(() ->
                equipmentTypeRepository.save(new EquipmentType(null, "Utility Vehicle", "Vehicles", "Units", "Reconnaissance carrier", true)));
        EquipmentType safety = equipmentTypeRepository.findByName("Safety Equipment").orElseGet(() ->
                equipmentTypeRepository.save(new EquipmentType(null, "Safety Equipment", "Safety & Medical", "Sets", "Trauma kits", true)));
        EquipmentType comms = equipmentTypeRepository.findByName("Communications Equipment").orElseGet(() ->
                equipmentTypeRepository.save(new EquipmentType(null, "Communications Equipment", "Communications", "Units", "Encrypted radios", true)));
        EquipmentType protective = equipmentTypeRepository.findByName("Protective Equipment").orElseGet(() ->
                equipmentTypeRepository.save(new EquipmentType(null, "Protective Equipment", "Protective Gear", "Sets", "Tactical vests", true)));

        // 4. Seed Development Accounts
        // ADMIN: admin@gmail.com / Admin@123 (base_id MUST be null, role MUST be ADMIN)
        User admin = userRepository.findByEmail("admin@gmail.com").orElse(null);
        if (admin == null) {
            admin = new User(null, "Major General Marcus Vance", "admin@gmail.com", passwordEncoder.encode("Admin@123"), Role.ADMIN, null, true);
            userRepository.save(admin);
            logger.info("Created Admin account: admin@gmail.com / Admin@123");
        } else {
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            admin.setBase(null);
            admin.setActive(true);
            userRepository.save(admin);
            logger.info("Reset and verified Admin account: admin@gmail.com / Admin@123");
        }

        // BASE_COMMANDER: commander1@example.com / Commander@123 (assigned to Alpha Base)
        User commander = userRepository.findByEmail("commander1@example.com").orElse(null);
        if (commander == null) {
            commander = new User(null, "Colonel Sarah Sterling", "commander1@example.com", passwordEncoder.encode("Commander@123"), Role.BASE_COMMANDER, alpha, true);
            userRepository.save(commander);
        } else {
            commander.setPassword(passwordEncoder.encode("Commander@123"));
            commander.setBase(alpha);
            commander.setActive(true);
            userRepository.save(commander);
        }

        // LOGISTICS_OFFICER: logistics@example.com / Logistics@123 (Alpha Base)
        User logistics = userRepository.findByEmail("logistics@example.com").orElse(null);
        if (logistics == null) {
            logistics = new User(null, "Captain David Miller", "logistics@example.com", passwordEncoder.encode("Logistics@123"), Role.LOGISTICS_OFFICER, alpha, true);
            userRepository.save(logistics);
        } else {
            logistics.setPassword(passwordEncoder.encode("Logistics@123"));
            logistics.setBase(alpha);
            logistics.setActive(true);
            userRepository.save(logistics);
        }

        // 5. Seed initial opening balances if absent
        if (openingBalanceRepository.findByBaseIdAndEquipmentTypeId(alpha.getId(), transport.getId()).isEmpty()) {
            openingBalanceRepository.save(new InventoryOpeningBalance(null, alpha, transport, 100, LocalDate.of(2026, 1, 1), admin));
            openingBalanceRepository.save(new InventoryOpeningBalance(null, alpha, utility, 80, LocalDate.of(2026, 1, 1), admin));
            openingBalanceRepository.save(new InventoryOpeningBalance(null, alpha, safety, 250, LocalDate.of(2026, 1, 1), admin));
            openingBalanceRepository.save(new InventoryOpeningBalance(null, alpha, comms, 150, LocalDate.of(2026, 1, 1), admin));
            openingBalanceRepository.save(new InventoryOpeningBalance(null, alpha, protective, 300, LocalDate.of(2026, 1, 1), admin));
            openingBalanceRepository.save(new InventoryOpeningBalance(null, bravo, transport, 50, LocalDate.of(2026, 1, 1), admin));
            openingBalanceRepository.save(new InventoryOpeningBalance(null, bravo, utility, 40, LocalDate.of(2026, 1, 1), admin));
            openingBalanceRepository.save(new InventoryOpeningBalance(null, bravo, comms, 75, LocalDate.of(2026, 1, 1), admin));
            openingBalanceRepository.save(new InventoryOpeningBalance(null, charlie, transport, 60, LocalDate.of(2026, 1, 1), admin));
            openingBalanceRepository.save(new InventoryOpeningBalance(null, charlie, protective, 120, LocalDate.of(2026, 1, 1), admin));
        }

        logger.info("Database initialized successfully with Development Seed Accounts.");
    }
}
