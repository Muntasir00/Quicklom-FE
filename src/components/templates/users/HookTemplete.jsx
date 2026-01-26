import { useState, useEffect } from "react";

export const useExampleHook = (initialValue = null) => {
    const [data, setData] = useState(initialValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Example async task
            const response = await fetch("/api/example");
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        loading,
        error,
        refresh: fetchData,
    };
};
