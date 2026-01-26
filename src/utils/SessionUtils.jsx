export const SESSION_KEYS = Object.freeze({
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
    USER_ROLE: 'role',
    INSTITUTE_CATEGORY_ID: 'institute_category_id',
    INSTITUTE_CATEGORY_NAME: 'institute_category_name',
    PROFESSIONAL_CATEGORY_ID: 'professional_category_id',
    PROFESSIONAL_CATEGORY_NAME: 'professional_category_name',
});

export const SessionUtil = {
    set: (key, value) => {
        if (!Object.values(SESSION_KEYS).includes(key)) {
            console.warn(`[Session] Invalid key: ${key}`);
            return;
        }
        if (value !== undefined && value !== null) {
            sessionStorage.setItem(key, value);
        }
    },

    get: (key) => {
        if (!Object.values(SESSION_KEYS).includes(key)) {
            console.warn(`[Session] Invalid key: ${key}`);
            return null;
        }
        return sessionStorage.getItem(key);
    },

    remove: (key) => {
        if (!Object.values(SESSION_KEYS).includes(key)) {
            console.warn(`[Session] Invalid key: ${key}`);
            return;
        }
        sessionStorage.removeItem(key);
    },

    getAll: () => {
        const data = {};
        for (const key of Object.values(SESSION_KEYS)) {
            data[key] = Session.get(key);
        }
        return data;
    },

    clearAll: () => {
        Object.values(SESSION_KEYS).forEach((key) => sessionStorage.removeItem(key));
    },

    logout: () => {
        Session.clearAll();
    },
};
