package kh.BackendCapstone.constant;

import lombok.Getter;

@Getter
public enum Membership {

    ACCESSION("ACCESSION"),
    SECESSION("SECESSION");

    private final String value;

    // 생성자 추가
    Membership(String value) {
        this.value = value;
    }
}
