/**
 * Agreement Template Router
 * Location: src/components/agreement/AgreementTemplateRouter.jsx
 *
 * Routes to correct agreement template based on agreement_type
 * Supports: agency_clinic, agency_agency, professional_clinic
 */
import React from 'react';
import AgencyClinicAgreement from './AgencyClinicAgreement';
import AgencyPartnershipAgreement from './AgencyPartnershipAgreement';
import DirectHireAgreement from './DirectHireAgreement';
import './AgreementTemplateRouter.css'; // Optional: for custom styling

const AgreementTemplateRouter = ({ agreement }) => {
    if (!agreement) {
        return (
            <div className="alert alert-warning">
                <strong>No Agreement Data</strong>
                <p>Unable to load agreement. Please contact support if this issue persists.</p>
            </div>
        );
    }

    const { agreement_type, agreement_data } = agreement;

    // Type labels for display
    const typeLabels = {
        'agency_clinic': '🏢 → 🏥 Agency to Clinic Recruitment',
        'agency_agency': '🏢 ↔ 🏢 Agency Partnership Placement',
        'professional_clinic': '👤 → 🏥 Direct Hire Employment'
    };

    // Badge colors
    const typeBadgeColors = {
        'agency_clinic': 'success',
        'agency_agency': 'primary',
        'professional_clinic': 'warning'
    };

    const agreementTypeLabel = typeLabels[agreement_type] || `Unknown Type: ${agreement_type}`;
    const badgeColor = typeBadgeColors[agreement_type] || 'secondary';

    return (
        <div className="agreement-wrapper">
            {/* Agreement Type Badge */}
            <div className="agreement-type-header mb-4">
                <div className="d-flex align-items-center justify-content-between">
                    <span className={`badge bg-${badgeColor} agreement-type-badge`}>
                        {agreementTypeLabel}
                    </span>
                    <small className="text-muted">
                        Agreement #: {agreement.agreement_number}
                    </small>
                </div>
                <hr className="mt-2 mb-3" />
            </div>

            {/* Route to Correct Template */}
            {agreement_type === 'agency_clinic' && (
                <AgencyClinicAgreement agreementData={agreement_data} />
            )}

            {agreement_type === 'agency_agency' && (
                <AgencyPartnershipAgreement agreementData={agreement_data} />
            )}

            {agreement_type === 'professional_clinic' && (
                <DirectHireAgreement agreementData={agreement_data} />
            )}

            {/* Error Handling for Unknown Types */}
            {!['agency_clinic', 'agency_agency', 'professional_clinic'].includes(agreement_type) && (
                <div className="alert alert-danger mt-4">
                    <h4 className="alert-heading">Unknown Agreement Type</h4>
                    <p>
                        <strong>Error:</strong> The agreement type "<code>{agreement_type}</code>" is not recognized.
                    </p>
                    <hr />
                    <p className="mb-0">
                        Please contact support at <a href="mailto:support@quicklocum.ca">support@quicklocum.ca</a> for assistance.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgreementTemplateRouter;
