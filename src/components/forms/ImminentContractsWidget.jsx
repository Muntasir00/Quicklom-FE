import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import professionalUpcomingContractsService from "@services/professional/UpcomingContractsService";
import instituteUpcomingContractsService from "@services/institute/UpcomingContractsService";

/**
 * Imminent Contracts Widget for Sidebar
 * Displays alert for contracts starting soon
 * Can be used in both institute and professional sidebars
 */
const ImminentContractsWidget = ({ userType = 'professional' }) => {
    const [imminentCount, setImminentCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [contracts, setContracts] = useState([]);

    const service = userType === 'professional'
        ? professionalUpcomingContractsService
        : instituteUpcomingContractsService;

    useEffect(() => {
        fetchImminentContracts();

        // Refresh every 5 minutes
        const interval = setInterval(fetchImminentContracts, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchImminentContracts = async () => {
        try {
            const data = await service.getImminentContracts(72); // 72 hours = 3 days
            setContracts(data);
            setImminentCount(data.length);
        } catch (error) {
            console.error('Error fetching imminent contracts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || imminentCount === 0) {
        return null;
    }

    // Get the most urgent contract
    const criticalContracts = contracts.filter(c => c.urgency_level === 'critical');
    const highPriorityContracts = contracts.filter(c => c.urgency_level === 'high');

    const getDaysText = (days) => {
        if (days === 0) return 'TODAY';
        if (days === 1) return 'TOMORROW';
        return `in ${days} day${days !== 1 ? 's' : ''}`;
    };

    return (
        <div className="alert-card urgent-alert" style={{ marginBottom: '1rem' }}>
            <div className="alert-icon">
                <i className="fas fa-calendar-exclamation"></i>
            </div>
            <div className="alert-content">
                <h6 className="alert-title">
                    {criticalContracts.length > 0 ? '🔴 URGENT CONTRACTS' : '🟡 Upcoming Contracts'}
                </h6>
                <p className="alert-text">
                    <strong>{imminentCount}</strong> contract{imminentCount !== 1 ? 's' : ''} starting soon
                </p>

                {/* Show most urgent contract */}
                {contracts[0] && (
                    <div style={{
                        fontSize: '0.85rem',
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            Next: {contracts[0].contract_type_name}
                        </div>
                        <div style={{ fontSize: '0.75rem' }}>
                            Starts {getDaysText(contracts[0].days_until_start)}
                        </div>
                    </div>
                )}

                <Link
                    to={`/${userType}/upcoming-contracts`}
                    className="alert-button"
                    style={{ marginTop: '0.75rem' }}
                >
                    <i className="fas fa-eye mr-2"></i>
                    View All
                </Link>
            </div>
            <div className="alert-pulse"></div>
        </div>
    );
};

export default ImminentContractsWidget;