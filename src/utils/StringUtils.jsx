export function upperCaseFirst(str) {
    try {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    } catch (error) {
        console.error("Error ", error);
        return "";
    }
}


export function upperCaseWords(str) {
    try {
        if (!str) return "";
        return str
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    } catch (error) {
        console.error("Error ", error);
        return "";
    }
}


/**
 * Cleans a contract name to a normalized format.
 * Example: "Permanent Staffing(Dental) " -> "permanent_staffing_dental"
 *
 * @param {string} name - The contract name to clean
 * @returns {string} - The cleaned contract name
 */
export const cleanContractName = (name) => {
    try {
        if (typeof name !== "string") return "";

        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_") // replace non-alphanumeric with _
            .replace(/^_+|_+$/g, "");    // remove leading/trailing underscores
     } catch (error) {
        console.error("Error ", error);
        return "";
    }
};
