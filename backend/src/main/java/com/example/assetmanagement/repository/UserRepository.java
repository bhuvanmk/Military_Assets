package com.example.assetmanagement.repository;

import com.example.assetmanagement.entity.User;
import com.example.assetmanagement.enums.Role;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    @EntityGraph(attributePaths = {"base"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"base"})
    Optional<User> findById(Long id);

    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    List<User> findAllByRole(Role role);
    List<User> findAllByBaseId(Long baseId);
}
