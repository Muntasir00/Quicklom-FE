/**
 * Agency Partnership Agreement Component
 * Location: src/components/agreement/AgencyPartnershipAgreement.jsx
 *
 * Renders agreement for Agency ↔ Agency partnerships
 * Used when one agency submits a candidate to another agency's contract
 */

import React from 'react';

const AgencyPartnershipAgreement = ({ agreementData }) => {
    if (!agreementData) return null;

    const {
        agency_a = {},
        agency_b = {},
        job = {},
        fees = {},
        guarantee = {},
        ownership = {},
        agreement = {},
    } = agreementData;

    const agencyAName = agency_a.name || 'Provider Agency';
    const agencyAAddress = agency_a.address || '';
    const agencyAProvince = agency_a.province || 'ON';
    const agencyAEmail = agency_a.email || '';

    const agencyBName = agency_b.name || 'Client Agency';
    const agencyBAddress = agency_b.address || '';
    const agencyBEmail = agency_b.email || '';

    const jobTitle = job.title || 'Healthcare Professional';
    const jobSector = job.sector || 'Healthcare';

    const agencyFees = fees.agencyFees;
    const requiresFeeInput = fees.requiresInput || false;
    const feeSplit = fees.feeSplit || '50/50';

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
    const provinceLaw = provinceLawMap[agencyAProvince] || 'Ontario';

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
        section: {
            margin: '25px 0'
        },
        ul: {
            margin: '10px 0',
            paddingLeft: '30px'
        },
        li: {
            margin: '8px 0'
        },
        consentBox: {
            background: '#FFF3CD',
            border: '2px solid #FFC107',
            padding: '20px',
            margin: '20px 0',
            borderRadius: '5px'
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
            <h1 style={styles.h1}>Agency Partnership Agreement for Candidate Placement</h1>

            {/* Parties */}
            <div style={styles.parties}>
                <p><strong>THIS AGREEMENT</strong> is made and entered into on <strong>{startDate}</strong></p>
                <p><strong>BETWEEN:</strong></p>
                <p>
                    <strong>{agencyAName}</strong><br />
                    (hereinafter referred to as the <strong>"Provider"</strong>)<br />
                    Address: {agencyAAddress}<br />
                    Email: {agencyAEmail}
                </p>
                <p><strong>AND:</strong></p>
                <p>
                    <strong>{agencyBName}</strong><br />
                    (hereinafter referred to as the <strong>"Client"</strong>)<br />
                    Address: {agencyBAddress}<br />
                    Email: {agencyBEmail}
                </p>
            </div>

            {/* Recitals */}
            <h2 style={styles.h2}>RECITALS</h2>
            <div style={styles.section}>
                <p><strong>WHEREAS</strong> both parties are recruitment and staffing agencies operating in the {jobSector} sector;</p>
                <p><strong>WHEREAS</strong> the Client requires qualified candidates for positions they service;</p>
                <p><strong>WHEREAS</strong> the Provider has access to qualified candidates and wishes to partner with the Client;</p>
                <p><strong>WHEREAS</strong> both parties wish to enter into a partnership agreement for candidate placement;</p>
                <p><strong>NOW THEREFORE</strong>, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:</p>
            </div>

            {/* 1. Services */}
            <h2 style={styles.h2}>1. SERVICES</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>1.1 Scope</h3>
                <p>The Provider agrees to source, screen, and present qualified candidates to the Client for the position of <strong>{jobTitle}</strong> in the {jobSector} sector.</p>

                <h3 style={styles.h3}>1.2 Platform Facilitation</h3>
                <p>Both parties acknowledge that this agreement was facilitated through QuickLocum Inc. QuickLocum Inc. is not a party to this agreement and provides only the technology platform. Platform fees are invoiced separately.</p>
            </div>

            {/* 2. Candidate Consent */}
            <h2 style={styles.h2}>2. CANDIDATE CONSENT AND AUTHORIZATION</h2>
            <div style={styles.section}>
                <div style={styles.consentBox}>
                    <h3 style={{...styles.h3, color: '#856404', marginTop: 0}}>⚠️ Candidate Consent Requirement</h3>
                    <p><strong>The Provider hereby confirms, represents, and warrants</strong> that it has obtained all necessary consents, authorizations, and permissions from the candidate(s) being submitted for:</p>
                    <ul style={styles.ul}>
                        <li style={styles.li}>Representation and submission to the Client and end-client facilities</li>
                        <li style={styles.li}>Processing of personal information in accordance with privacy legislation</li>
                        <li style={styles.li}>Background verification and credential validation</li>
                        <li style={styles.li}>Disclosure of employment history and qualifications</li>
                    </ul>

                    <h3 style={styles.h3}>Indemnification</h3>
                    <p>The Provider agrees to indemnify and hold harmless the Client and QuickLocum Inc. from any claims arising from failure to obtain proper candidate consent.</p>

                    <p style={{marginTop: '15px'}}><strong>Platform Disclaimer:</strong> QuickLocum Inc. is not responsible for verifying candidate consent. This responsibility lies solely with the Provider.</p>
                </div>
            </div>

            {/* 3. Fees */}
            <h2 style={styles.h2}>3. FEES AND PAYMENT</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>3.1 Fee Agreement</h3>
                {requiresFeeInput || agencyFees === null ? (
                    <div style={styles.consentBox}>
                        <p><strong>Fee Pending:</strong> Parties must agree on fee split before signing.</p>
                    </div>
                ) : (
                    <p>Agreed fee split: <strong>{feeSplit}</strong> for total placement fee of <strong>${parseFloat(agencyFees).toFixed(2)} CAD</strong>.</p>
                )}

                <h3 style={styles.h3}>3.2 Payment Terms</h3>
                <p>Payment shall be due within 30 days of invoice. The Client is responsible for collecting fees from the end-client and distributing to the Provider per agreed split.</p>
            </div>

            {/* 4. Non-Circumvention */}
            <h2 style={styles.h2}>4. NON-CIRCUMVENTION</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>4.1 Direct Engagement Prohibition</h3>
                <p>Neither party may directly engage with candidates or clients introduced by the other party without written consent and payment of agreed fees for a period of <strong>{ownershipMonths} months</strong>.</p>

                <h3 style={styles.h3}>4.2 Platform Bypass Prohibition</h3>
                <p>Neither party may bypass QuickLocum Inc. for transactions initiated through the platform. All fees owed to QuickLocum Inc. must be paid regardless of offline arrangements.</p>
            </div>

            {/* 5. Guarantee */}
            <h2 style={styles.h2}>5. GUARANTEE</h2>
            <div style={styles.section}>
                <p>The Provider guarantees placements for <strong>{guaranteeDays} days</strong>. If the candidate voluntarily resigns or is terminated for cause during this period, the Provider shall provide a replacement candidate at no additional cost.</p>
            </div>

            {/* 6. Confidentiality */}
            <h2 style={styles.h2}>6. CONFIDENTIALITY</h2>
            <div style={styles.section}>
                <p>Both parties agree to maintain confidentiality of candidate information, business practices, and fee arrangements. Both parties shall comply with PIPEDA and provincial privacy legislation.</p>
            </div>

            {/* 7. Liability */}
            <h2 style={styles.h2}>7. LIABILITY</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>7.1 Independent Contractors</h3>
                <p>Both parties are independent contractors. Neither is an employee, agent, or partner of the other.</p>

                <h3 style={styles.h3}>7.2 Platform Disclaimer</h3>
                <p>QuickLocum Inc. is not liable for disputes between agencies, candidate performance, or payment issues. All claims must be resolved between the parties to this agreement.</p>
            </div>

            {/* 8. Termination */}
            <h2 style={styles.h2}>8. TERMINATION</h2>
            <div style={styles.section}>
                <p>Either party may terminate with <strong>{terminationNotice} days</strong> written notice. Termination does not affect obligations for placements made prior to termination or ownership rights during the exclusivity period.</p>
            </div>

            {/* 9. Governing Law */}
            <h2 style={styles.h2}>9. GOVERNING LAW</h2>
            <div style={styles.section}>
                <p>This Agreement shall be governed by the laws of <strong>{provinceLaw}</strong> and federal laws of Canada.</p>
            </div>

            {/* 10. Acknowledgment */}
            <h2 style={styles.h2}>10. ACKNOWLEDGMENT</h2>
            <div style={styles.section}>
                <p><strong>BY SIGNING, BOTH PARTIES ACKNOWLEDGE:</strong></p>
                <ul style={styles.ul}>
                    <li style={styles.li}>They have read and agree to all terms</li>
                    <li style={styles.li}>They have authority to enter this agreement</li>
                    <li style={styles.li}>This is a legally binding contract</li>
                    <li style={styles.li}>QuickLocum Inc. is not a party to this agreement</li>
                </ul>
            </div>

            {/* Signatures */}
            <div style={{ marginTop: '50px' }}>
                <h2 style={styles.h2}>SIGNATURES</h2>

                <div style={{ margin: '40px 0', padding: '20px', border: '1px solid #ddd', background: '#f8f9fa' }}>
                    <h3 style={styles.h3}>Provider (Agency A)</h3>
                    <p><strong>{agencyAName}</strong></p>
                    <div style={{ borderBottom: '2px solid #333', minHeight: '80px', margin: '20px 0' }} id="agency-signature-container">
                        {/* Signature will be inserted here */}
                    </div>
                    <div id="agency-metadata">
                        {/* Signature metadata will be inserted here */}
                    </div>
                </div>

                <div style={{ margin: '40px 0', padding: '20px', border: '1px solid #ddd', background: '#f8f9fa' }}>
                    <h3 style={styles.h3}>Client (Agency B)</h3>
                    <p><strong>{agencyBName}</strong></p>
                    <div style={{ borderBottom: '2px solid #333', minHeight: '80px', margin: '20px 0' }} id="client-signature-container">
                        {/* Signature will be inserted here */}
                    </div>
                    <div id="client-metadata">
                        {/* Signature metadata will be inserted here */}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <p>Agreement facilitated through QuickLocum Inc. | www.quicklocum.ca</p>
                <p><em>This is a legally binding agreement. Both parties should retain a copy.</em></p>
            </div>
        </div>
    );
};

export default AgencyPartnershipAgreement;
