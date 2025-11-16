package kh.BackendCapstone.entity;

import lombok.*;

import javax.persistence.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table
public class UserBank {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "userbank_id")
    private Long userBankId;
    private String bankName;
    private String bankAccount;
    private  Long withdrawal;

}