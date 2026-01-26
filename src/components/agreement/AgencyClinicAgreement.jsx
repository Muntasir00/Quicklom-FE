/**
 * Agreement Template Component
 * Location: src/components/agreement/AgreementTemplate.jsx
 *
 * Renders the full legal agreement directly in React
 */

import React from 'react';

const AgencyClinicAgreement = ({ agreementData }) => {
    if (!agreementData) return null;

    const {
        client = {},
        agency = {},
        job = {},
        fees = {},
        guarantee = {},
        ownership = {},
        agreement = {},
        candidate = {},
    } = agreementData;

    const clientName = client.name || 'Client';
    const clientAddress = client.address || '';
    const clientProvince = client.province || 'ON';
    const clientEmail = client.email || '';

    const agencyName = agency.name || 'Service Provider';
    const agencyAddress = agency.address || '';
    const agencyEmail = agency.email || '';

    const candidateName = candidate.name;  // Accepted candidate name (may be null)

    const jobTitle = job.title || 'Healthcare Professional';
    const jobSector = job.sector || 'Healthcare';

    const agencyFees = fees.agencyFees;
    const requiresFeeInput = fees.requiresInput || false;

    const guaranteeDays = guarantee.days || 90;
    const ownershipMonths = ownership.months || 12;

    const startDate = agreement.startDate || new Date().toISOString().split('T')[0];
    const terminationNotice = agreement.terminationNotice || 30;

    const provinceLawMap = {
        'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba',
        'NB': 'New Brunswick', 'NL': 'Newfoundland and Labrador',
        'NT': 'Northwest Territories', 'NS': 'Nova Scotia',
        'NU': 'Nunavut', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
        'QC': 'Quebec', 'SK': 'Saskatchewan', 'YT': 'Yukon'
    };
    const provinceLaw = provinceLawMap[clientProvince] || 'Ontario';

    const styles = {
        container: {
            width: '100%',
            maxWidth: '100%',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.6',
            color: '#333'
        },
        h1: {
            textAlign: 'center',
            color: '#1a5490',
            fontSize: '24px',
            marginBottom: '30px',
            textTransform: 'uppercase',
            borderBottom: '3px solid #1a5490',
            paddingBottom: '10px'
        },
        h2: {
            color: '#1a5490',
            fontSize: '18px',
            marginTop: '30px',
            marginBottom: '15px',
            borderLeft: '4px solid #1a5490',
            paddingLeft: '10px'
        },
        h3: {
            color: '#2c5aa0',
            fontSize: '16px',
            marginTop: '20px',
            marginBottom: '10px'
        },
        parties: {
            background: '#f8f9fa',
            padding: '20px',
            borderLeft: '4px solid #1a5490',
            margin: '20px 0'
        },
        feeDisclosure: {
            background: '#fff3cd',
            border: '2px solid #ffc107',
            padding: '20px',
            margin: '20px 0',
            borderRadius: '5px'
        },
        section: {
            margin: '25px 0'
        },
        subsection: {
            marginLeft: '20px',
            marginTop: '10px'
        },
        ul: {
            margin: '10px 0',
            paddingLeft: '30px'
        },
        li: {
            margin: '8px 0'
        },
        important: {
            fontWeight: 'bold',
            color: '#d32f2f'
        },
        footer: {
            marginTop: '50px',
            paddingTop: '20px',
            borderTop: '2px solid #ddd',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.h1}>Recruitment and Staffing Services Agreement</h1>

            {/* Parties */}
            <div style={styles.parties}>
                <p><strong>THIS AGREEMENT</strong> is made and entered into on <strong>{startDate}</strong></p>
                <p><strong>BETWEEN:</strong></p>
                <p>
                    <strong>{clientName}</strong><br />
                    (hereinafter referred to as the <strong>"Client"</strong>)<br />
                    Address: {clientAddress}<br />
                    Email: {clientEmail}
                </p>
                <p><strong>AND:</strong></p>
                <p>
                    <strong>{agencyName}</strong><br />
                    (hereinafter referred to as the <strong>"Service Provider"</strong>)<br />
                    Address: {agencyAddress}<br />
                    Email: {agencyEmail}
                </p>
                {candidateName && (
                    <p style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f4f8', borderLeft: '4px solid #1a5490' }}>
                        <strong>Proposed Candidate:</strong> {candidateName}
                    </p>
                )}
            </div>

            {/* Recitals */}
            <h2 style={styles.h2}>RECITALS</h2>
            <div style={styles.section}>
                <p><strong>WHEREAS</strong> the Client operates in the {jobSector} sector and requires recruitment and staffing services;</p>
                <p><strong>WHEREAS</strong> the Service Provider is engaged in the business of providing recruitment and staffing services;</p>
                <p><strong>WHEREAS</strong> both parties wish to enter into an agreement for the provision of recruitment services;</p>
                <p><strong>NOW THEREFORE</strong>, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:</p>
            </div>

            {/* 1. Services */}
            <h2 style={styles.h2}>1. SERVICES</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>1.1 Scope of Services</h3>
                <p>The Service Provider agrees to provide recruitment and staffing services to the Client for the position of <strong>{jobTitle}</strong> in the {jobSector} sector, which services may include:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Candidate sourcing, screening, and assessment</li>
                    <li style={styles.li}>Background verification and credential validation</li>
                    <li style={styles.li}>Presentation of qualified candidates to the Client</li>
                    <li style={styles.li}>Coordination of interviews and negotiations</li>
                    <li style={styles.li}>Assistance with offer preparation and acceptance</li>
                </ul>

                <h3 style={styles.h3}>1.2 Platform Services</h3>
                <p>Both parties acknowledge that this agreement is facilitated through QuickLocum Inc., a digital recruitment platform ("the Platform"), and agree to the Platform's terms of service.</p>
            </div>

            {/* 2. Fees and Payment */}
            <h2 style={styles.h2}>2. FEES AND PAYMENT TERMS</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>2.1 Service Provider Fees</h3>
                {requiresFeeInput || agencyFees === null ? (
                    <div style={styles.feeDisclosure}>
                        <h3 style={{ color: '#856404', marginTop: 0 }}>⚠️ Fee Pending</h3>
                        <p>The Service Provider's placement fee is pending submission and will be confirmed prior to final agreement execution.</p>
                    </div>
                ) : agencyFees > 0 ? (
                    <p>The Client agrees to pay the Service Provider a placement fee of <strong>${parseFloat(agencyFees).toFixed(2)} CAD</strong> upon successful placement and completion of the guarantee period specified in Section 3.</p>
                ) : (
                    <p>No Service Provider placement fee applies to this agreement.</p>
                )}

                <h3 style={styles.h3}>2.2 Payment Terms</h3>
                <p>Payment of Service Provider fees shall be due within thirty (30) days of invoice date. Late payments may incur interest at the rate permitted by law.</p>
            </div>

            {/* 3. Guarantee Period */}
            <h2 style={styles.h2}>3. GUARANTEE PERIOD</h2>
            <div style={styles.section}>
                <p>The Service Provider guarantees that any candidate placed with the Client will remain in the position for a minimum of <strong>{guaranteeDays} days</strong> from the start date. If the candidate voluntarily leaves or is terminated for cause within this period, the Service Provider agrees to:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Provide a replacement candidate at no additional fee; OR</li>
                    <li style={styles.li}>Refund a prorated portion of the placement fee based on the time served</li>
                </ul>
            </div>

            {/* 4. Client Ownership */}
            <h2 style={styles.h2}>4. CLIENT OWNERSHIP AND EXCLUSIVITY</h2>
            <div style={styles.section}>
                <p>For a period of <strong>{ownershipMonths} months</strong> following the introduction of a candidate to the Client, the candidate shall be considered the exclusive property of the Client for hiring purposes. During this period, the Service Provider shall not present the same candidate to other clients for similar positions without the Client's written consent.</p>
            </div>

            {/* 5. Confidentiality */}
            <h2 style={styles.h2}>5. CONFIDENTIALITY</h2>
            <div style={styles.section}>
                <p>Both parties agree to maintain strict confidentiality regarding:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Candidate information and personal data</li>
                    <li style={styles.li}>Business practices and trade secrets</li>
                    <li style={styles.li}>Financial terms and fee structures</li>
                    <li style={styles.li}>Any proprietary information exchanged during the recruitment process</li>
                </ul>
                <p>This confidentiality obligation shall survive the termination of this Agreement and continue indefinitely, except as required by law.</p>
            </div>

            {/* 6. Data Protection */}
            <h2 style={styles.h2}>6. DATA PROTECTION AND PRIVACY</h2>
            <div style={styles.section}>
                <p>Both parties agree to comply with all applicable Canadian privacy legislation, including but not limited to:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Personal Information Protection and Electronic Documents Act (PIPEDA)</li>
                    <li style={styles.li}>Provincial privacy legislation where applicable</li>
                    <li style={styles.li}>Healthcare sector-specific privacy requirements</li>
                </ul>
                <p>All personal information collected, used, or disclosed in connection with this Agreement shall be handled in accordance with these laws and the QuickLocum Privacy Policy.</p>
            </div>

            {/* 7. Compliance */}
            <h2 style={styles.h2}>7. REGULATORY COMPLIANCE</h2>
            <div style={styles.section}>
                <p>Both parties warrant that they:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Hold all necessary licenses and registrations required to operate in their respective jurisdictions</li>
                    <li style={styles.li}>Comply with all applicable employment standards and labor laws</li>
                    <li style={styles.li}>Maintain appropriate professional liability insurance where required</li>
                    <li style={styles.li}>Adhere to healthcare industry regulations and standards</li>
                </ul>
            </div>

            {/* 8. Liability */}
            <h2 style={styles.h2}>8. LIMITATION OF LIABILITY</h2>
            <div style={styles.section}>
                <p>Neither party shall be liable to the other for any indirect, incidental, consequential, or punitive damages arising from this Agreement. The Service Provider's total liability shall not exceed the total fees paid or payable under this Agreement.</p>
                <p><strong>Platform Limitation:</strong> QuickLocum Inc.'s role is limited to facilitating the connection between parties. QuickLocum Inc. is not liable for the performance, conduct, or quality of services provided by either party.</p>
            </div>

            {/* 9. Term and Termination */}
            <h2 style={styles.h2}>9. TERM AND TERMINATION</h2>
            <div style={styles.section}>
                <p>This Agreement shall commence on the date first written above and continue until:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Successful placement and completion of the guarantee period; OR</li>
                    <li style={styles.li}>Termination by either party with <strong>{terminationNotice} days</strong> written notice</li>
                </ul>
                <p>Termination does not affect any obligations that have accrued prior to the termination date, including payment obligations.</p>
            </div>

            {/* 10. Dispute Resolution */}
            <h2 style={styles.h2}>10. DISPUTE RESOLUTION</h2>
            <div style={styles.section}>
                <p>Any disputes arising from this Agreement shall be resolved through:</p>
                <ol style={styles.ul}>
                    <li style={styles.li}>Good faith negotiation between the parties</li>
                    <li style={styles.li}>Mediation, if negotiation fails</li>
                    <li style={styles.li}>Binding arbitration in accordance with the laws of {provinceLaw}, if mediation is unsuccessful</li>
                </ol>
            </div>

            {/* 11. Governing Law */}
            <h2 style={styles.h2}>11. GOVERNING LAW</h2>
            <div style={styles.section}>
                <p>This Agreement shall be governed by and construed in accordance with the laws of the Province of <strong>{provinceLaw}</strong> and the federal laws of Canada applicable therein.</p>
            </div>

            {/* 12. Entire Agreement */}
            <h2 style={styles.h2}>12. ENTIRE AGREEMENT</h2>
            <div style={styles.section}>
                <p>This Agreement, together with the QuickLocum Terms of Service, constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements, whether written or oral.</p>
                <p>This Agreement may only be amended by written agreement signed by both parties.</p>
            </div>

            {/* Signatures Section */}
            <div style={{ marginTop: '50px', pageBreakInside: 'avoid' }}>
                <h2 style={styles.h2}>SIGNATURES</h2>

                <div style={{ margin: '40px 0', padding: '20px', border: '1px solid #ddd', background: '#f8f9fa' }}>
                    <h3 style={styles.h3}>Service Provider Signature</h3>
                    <div style={{ borderBottom: '2px solid #333', minHeight: '80px', margin: '20px 0' }} id="agency-signature-container">
                        {/* Signature will be inserted here */}
                    </div>
                    <div id="agency-signature-metadata">
                        {/* Signature metadata will be inserted here */}
                    </div>
                </div>

                <div style={{ margin: '40px 0', padding: '20px', border: '1px solid #ddd', background: '#f8f9fa' }}>
                    <h3 style={styles.h3}>Client Signature</h3>
                    <div style={{ borderBottom: '2px solid #333', minHeight: '80px', margin: '20px 0' }} id="client-signature-container">
                        {/* Signature will be inserted here */}
                    </div>
                    <div id="client-signature-metadata">
                        {/* Signature metadata will be inserted here */}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <p>This agreement was generated through QuickLocum Inc., a digital healthcare recruitment platform.</p>
                <p>QuickLocum Inc. | www.quicklocum.ca | support@quicklocum.ca</p>
                <p><em>This is a legally binding agreement. Both parties should retain a copy for their records.</em></p>
            </div>
        </div>
    );
};

export default AgencyClinicAgreement;
