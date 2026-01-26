/**
 * Role mapping for various user types with common variations
 * @property {Array<string>} admin - Admin role variations
 * @property {Array<string>} institute - Institute role variations
 * @property {Array<string>} professional - Professional role variations
*/

import { ROLE_MAP } from "@constants/UserConstants";

/**
 * Levenshtein distance function
*/
const levenshtein = (a, b) => {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            if (b[j - 1] === a[i - 1]) {
                matrix[j][i] = matrix[j - 1][i - 1];
            } else {
                matrix[j][i] = Math.min(
                    matrix[j - 1][i] + 1,      // deletion
                    matrix[j][i - 1] + 1,      // insertion
                    matrix[j - 1][i - 1] + 1   // substitution
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

/**
 * Resolve a role string, handling typos or variations
 * @param {string} rawRole - input role string
 * @param {string} defaultRole - fallback if unknown
 * @returns {string} normalized role: "admin" | "institute" | "professional"
 */
export const RoleResolver = (rawRole, defaultRole = "professional") => {
    if (!rawRole || typeof rawRole !== "string") return defaultRole;

    const cleanRole = rawRole.trim().toLowerCase();

    // Exact match
    const exactMatch = Object.keys(ROLE_MAP).find((key) =>
        ROLE_MAP[key].some((variant) => variant.toLowerCase() === cleanRole)
    );
    if (exactMatch) return exactMatch;

    // Partial match (includes)
    const partialMatch = Object.keys(ROLE_MAP).find((key) =>
        ROLE_MAP[key].some((variant) => cleanRole.includes(variant.toLowerCase()))
    );
    if (partialMatch) return partialMatch;

    // Fuzzy match using Levenshtein distance (allow distance <= 2)
    let bestMatch = null;
    let minDistance = Infinity;

    Object.keys(ROLE_MAP).forEach((key) => {
        ROLE_MAP[key].forEach((variant) => {
            const distance = levenshtein(cleanRole, variant.toLowerCase());
            if (distance < minDistance && distance <= 2) { // threshold
                minDistance = distance;
                bestMatch = key;
            }
        });
    });

    return bestMatch || defaultRole;
};
