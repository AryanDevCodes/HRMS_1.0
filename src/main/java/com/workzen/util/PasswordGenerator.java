package com.workzen.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class PasswordGenerator {
    
    private static final String UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
    private static final String NUMBERS = "0123456789";
    private static final String SPECIAL_CHARACTERS = "@#$%^&*";
    
    private static final String ALL_CHARACTERS = UPPERCASE_LETTERS + LOWERCASE_LETTERS + NUMBERS + SPECIAL_CHARACTERS;
    
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateTemporaryPassword() {
        StringBuilder password = new StringBuilder();
        
        // Add 2 uppercase letters
        for (int i = 0; i < 2; i++) {
            password.append(UPPERCASE_LETTERS.charAt(secureRandom.nextInt(UPPERCASE_LETTERS.length())));
        }
        
        // Add 4 lowercase letters  
        for (int i = 0; i < 4; i++) {
            password.append(LOWERCASE_LETTERS.charAt(secureRandom.nextInt(LOWERCASE_LETTERS.length())));
        }
        
        // Add 2 numbers
        for (int i = 0; i < 2; i++) {
            password.append(NUMBERS.charAt(secureRandom.nextInt(NUMBERS.length())));
        }
        
        // Add 1 special character
        password.append(SPECIAL_CHARACTERS.charAt(secureRandom.nextInt(SPECIAL_CHARACTERS.length())));
        
        // Shuffle the password to randomize character positions
        return shuffleString(password.toString());
    }
    
 
    public String generatePassword(int length) {
        if (length < 8) {
            throw new IllegalArgumentException("Password length must be at least 8 characters");
        }
        
        StringBuilder password = new StringBuilder();
        
        password.append(UPPERCASE_LETTERS.charAt(secureRandom.nextInt(UPPERCASE_LETTERS.length())));
        password.append(LOWERCASE_LETTERS.charAt(secureRandom.nextInt(LOWERCASE_LETTERS.length())));
        password.append(NUMBERS.charAt(secureRandom.nextInt(NUMBERS.length())));
        password.append(SPECIAL_CHARACTERS.charAt(secureRandom.nextInt(SPECIAL_CHARACTERS.length())));
        
        for (int i = 4; i < length; i++) {
            password.append(ALL_CHARACTERS.charAt(secureRandom.nextInt(ALL_CHARACTERS.length())));
        }
        
        return shuffleString(password.toString());
    }
    

    private String shuffleString(String input) {
        char[] characters = input.toCharArray();
        
        // Fisher-Yates shuffle algorithm
        for (int i = characters.length - 1; i > 0; i--) {
            int j = secureRandom.nextInt(i + 1);
            
            // Swap characters[i] with characters[j]
            char temp = characters[i];
            characters[i] = characters[j];
            characters[j] = temp;
        }
        
        return new String(characters);
    }
    
   
    public boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> SPECIAL_CHARACTERS.indexOf(ch) >= 0);
        
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}
