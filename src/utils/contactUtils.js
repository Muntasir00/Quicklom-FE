export const getContactData = (contact) => {
    if (!contact) return null;

    // Skip admin objects
    if (contact.admins) return null;
    let user = null;
    let contracts = [];

    // IMPORTANT: Check for nested user object FIRST before checking direct properties
    // Case 1: New grouped structure with user and contracts array
    // This is YOUR structure: { user_id: 5, user: {...}, contracts: [...] }
    if (contact.user && typeof contact.user === 'object' && contact.user.id) {
        user = contact.user;

        // Contracts are in a separate array at root level
        if (Array.isArray(contact.contracts)) {
            contracts = contact.contracts;
        }
    }
    // Case 2: Old structure - contact application with embedded user
    else if (contact.user_id && contact.user && contact.contract_id) {
        user = contact.user;

        // Create a contract from the contract_id if it exists
        if (contact.contract_id) {
            contracts = [{
                contract_id: contact.contract_id,
                contract_name: contact.contract?.name || `Contract #${contact.contract_id}`,
                contract_status: contact.contract?.status || contact.status || "pending",
                application_id: contact.id,
                application_status: contact.status,
                applied_at: contact.applied_at
            }];
        }
    }
    // Case 3: Contact IS the user directly (NO nested user object)
    // Only check this if there's NO contact.user property
    else if (!contact.user && contact.id && contact.name && contact.email) {
        user = contact;

        if (contact.contract_id) {
            contracts = [{
                contract_id: contact.contract_id,
                contract_name: `Contract #${contact.contract_id}`,
                contract_status: contact.status || "pending",
                application_id: contact.id,
                application_status: contact.status,
                applied_at: contact.applied_at
            }];
        }
    }

    if (!user) return null;

    return {
        user,
        contracts,
        originalContact: contact
    };
};

/**
 * Get all contracts (including booked)
 * Previously filtered out booked contracts, but now we want to show them
 */
export const getActiveContracts = (contact) => {
    const data = getContactData(contact);
    if (!data) return [];

    // Return all contracts with a status (no filtering)
    return data.contracts.filter(contract => contract.contract_status);
};

/**
 * Get contract count
 */
export const getContractCount = (contact) => {
    return getActiveContracts(contact).length;
};

/**
 * Format contracts for display
 */
export const formatContractsDisplay = (contact) => {
    const activeContracts = getActiveContracts(contact);

    if (activeContracts.length === 0) {
        return null;
    }

    if (activeContracts.length === 1) {
        return activeContracts[0].contract_name || "Contract";
    }

    return `${activeContracts.length} contracts`;
};

/**
 * Check if contact has contracts
 */
export const hasContracts = (contact) => {
    return getActiveContracts(contact).length > 0;
};

/**
 * Get contract by ID
 */
export const getContractById = (contact, contractId) => {
    const data = getContactData(contact);
    if (!data) return null;

    return data.contracts.find(c => c.contract_id === contractId);
};

/**
 * Filter contacts by search query (including contract names)
 */
export const filterContactsBySearch = (contacts, searchQuery) => {
    if (!searchQuery) return contacts;

    const query = searchQuery.toLowerCase();

    return contacts.filter(contact => {
        const data = getContactData(contact);
        if (!data) return false;

        const { user, contracts } = data;

        // Search in user name
        if (user.name?.toLowerCase().includes(query)) return true;

        // Search in user email
        if (user.email?.toLowerCase().includes(query)) return true;

        // Search in contract names
        const hasMatchingContract = contracts.some(contract =>
            contract.contract_name?.toLowerCase().includes(query)
        );

        return hasMatchingContract;
    });
};

/**
 * Clean contacts array (remove admin objects and invalid entries)
 */
export const cleanContacts = (contacts) => {
    if (!Array.isArray(contacts)) return [];

    return contacts.filter(contact => {
        // Remove admin object
        if (contact.admins) return false;

        // Check if we can extract valid data
        const data = getContactData(contact);
        return data !== null;
    });
};

/**
 * Group individual contract applications by user
 * Converts old structure to new grouped structure
 */
export const groupContactsByUser = (contacts) => {
    if (!Array.isArray(contacts)) return [];

    const usersMap = new Map();

    contacts.forEach(contact => {
        // Skip admin objects
        if (contact.admins) return;

        const data = getContactData(contact);
        if (!data) return;

        const userId = data.user.id;

        if (!usersMap.has(userId)) {
            usersMap.set(userId, {
                user_id: userId,
                user: data.user,
                contracts: []
            });
        }

        // Add contracts from this contact
        const userEntry = usersMap.get(userId);
        data.contracts.forEach(contract => {
            // Avoid duplicates
            if (!userEntry.contracts.some(c => c.contract_id === contract.contract_id)) {
                userEntry.contracts.push(contract);
            }
        });
    });

    return Array.from(usersMap.values());
};