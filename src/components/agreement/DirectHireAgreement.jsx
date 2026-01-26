/**
 * Direct Hire Agreement Component
 * Location: src/components/agreement/DirectHireAgreement.jsx
 *
 * Renders agreement for Professional ↔ Clinic direct hires
 * Used when a professional applies directly without agency involvement
 * Includes 10% platform fee disclosure
 */

import React from 'react';

const DirectHireAgreement = ({ agreementData }) => {
    if (!agreementData) return null;

    const {
        professional = {},
        clinic = {},
        agency = {},
        client = {},
        job = {},
        contract_details = {},
        contract = {},
        agreement = {},
    } = agreementData;

    // Support both professional/clinic and agency/client structures
    const professionalData = professional.name ? professional : agency;
    const clinicData = clinic.name ? clinic : client;

    const professionalName = professionalData.name || 'Professional';
    const professionalEmail = professionalData.email || '';
    const professionalLicense = professionalData.license_number || professionalData.licenseNumber || 'N/A';

    const clinicName = clinicData.name || 'Healthcare Facility';
    const clinicAddress = clinicData.address || '';
    const clinicProvince = clinicData.province || 'ON';
    const clinicEmail = clinicData.email || '';

    const jobTitle = job.title || 'Healthcare Professional';
    const jobSector = job.sector || 'Healthcare';

    // Support both contract_details and contract.contractData structures
    const contractData = contract_details.startDate ? contract_details : (contract.contractData || contract);

    const contractStart = contractData.startDate || contractData.start_date || '';
    const contractEnd = contractData.endDate || contractData.end_date || 'Ongoing';
    const compensation = contractData.compensation || contractData.hourly_rate || 'As agreed';
    const workSchedule = contractData.workSchedule || 'As specified in job posting';
    const platformFeePercentage = contractData.platformFeePercentage || 10;
    const platformFeeAmount = contractData.platformFeeAmount || 0;

    const startDate = agreement.startDate || new Date().toISOString().split('T')[0];

    const provinceLawMap = {
        'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba',
        'NB': 'New Brunswick', 'NL': 'Newfoundland and Labrador',
        'NT': 'Northwest Territories', 'NS': 'Nova Scotia',
        'NU': 'Nunavut', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
        'QC': 'Quebec', 'SK': 'Saskatchewan', 'YT': 'Yukon'
    };
    const provinceLaw = provinceLawMap[clinicProvince] || 'Ontario';

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
        platformFeeNotice: {
            background: '#E3F2FD',
            border: '2px solid #2196F3',
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
            <h1 style={styles.h1}>Direct Hire Employment Agreement</h1>

            {/* Parties */}
            <div style={styles.parties}>
                <p><strong>THIS AGREEMENT</strong> is made and entered into on <strong>{startDate}</strong></p>
                <p><strong>BETWEEN:</strong></p>
                <p>
                    <strong>{clinicName}</strong><br />
                    (hereinafter referred to as the <strong>"Employer"</strong>)<br />
                    Address: {clinicAddress}<br />
                    Email: {clinicEmail}
                </p>
                <p><strong>AND:</strong></p>
                <p>
                    <strong>{professionalName}</strong><br />
                    (hereinafter referred to as the <strong>"Professional"</strong>)<br />
                    Email: {professionalEmail}<br />
                    License Number: {professionalLicense}
                </p>
            </div>

            {/* Recitals */}
            <h2 style={styles.h2}>RECITALS</h2>
            <div style={styles.section}>
                <p><strong>WHEREAS</strong> the Employer operates a healthcare facility and requires professional services;</p>
                <p><strong>WHEREAS</strong> the Professional possesses the necessary qualifications and licenses to provide such services;</p>
                <p><strong>WHEREAS</strong> both parties connected through QuickLocum Inc., a healthcare recruitment platform;</p>
                <p><strong>NOW THEREFORE</strong>, in consideration of the mutual covenants contained herein, the parties agree as follows:</p>
            </div>

            {/* 1. Position and Duties */}
            <h2 style={styles.h2}>1. POSITION AND DUTIES</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>1.1 Position</h3>
                <p>The Employer engages the Professional to provide services as <strong>{jobTitle}</strong> in the {jobSector} sector.</p>

                <h3 style={styles.h3}>1.2 Contract Period</h3>
                <p><strong>Start Date:</strong> {contractStart}<br />
                   <strong>End Date:</strong> {contractEnd}</p>

                <h3 style={styles.h3}>1.3 Work Schedule</h3>
                <p>{workSchedule}</p>
            </div>

            {/* 2. Compensation */}
            <h2 style={styles.h2}>2. COMPENSATION</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>2.1 Payment</h3>
                <p>The Employer agrees to compensate the Professional as follows: <strong>{compensation}</strong></p>

                <h3 style={styles.h3}>2.2 Payment Terms</h3>
                <p>Payment shall be made in accordance with the Employer's standard payroll schedule, subject to applicable tax withholdings and deductions.</p>
            </div>

            {/* Platform Fee Notice */}
            <div style={styles.platformFeeNotice}>
                <h3 style={{...styles.h3, color: '#1565C0', marginTop: 0}}>💰 PLATFORM FEE DISCLOSURE</h3>
                <p><strong>Important Notice:</strong> This hiring was facilitated through QuickLocum Inc. The Employer acknowledges that a platform fee of <strong>{platformFeePercentage}%</strong> (approximately <strong>${platformFeeAmount.toFixed(2)} CAD</strong>) will be charged by QuickLocum Inc. for this placement.</p>
                <p>This platform fee is separate from this employment agreement and is governed by the Employer's Platform Services Agreement with QuickLocum Inc. The platform fee will be invoiced separately to the Employer.</p>
                <p style={{fontWeight: 'bold', marginTop: '10px'}}>⚠️ The Professional is NOT responsible for any platform fees.</p>
            </div>

            {/* 3. Professional Requirements */}
            <h2 style={styles.h2}>3. PROFESSIONAL REQUIREMENTS</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>3.1 Licensing and Credentials</h3>
                <p>The Professional represents and warrants that they hold all necessary licenses, certifications, and credentials required to provide the services outlined in this agreement.</p>

                <h3 style={styles.h3}>3.2 Background Checks</h3>
                <p>The Professional agrees to undergo background verification, credential validation, and reference checks as required by the Employer or QuickLocum Inc.</p>

                <h3 style={styles.h3}>3.3 Maintenance of Credentials</h3>
                <p>The Professional agrees to maintain all required licenses, certifications, and professional liability insurance throughout the term of this agreement.</p>
            </div>

            {/* 4. Obligations of the Professional */}
            <h2 style={styles.h2}>4. OBLIGATIONS OF THE PROFESSIONAL</h2>
            <div style={styles.section}>
                <p>The Professional agrees to:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Provide services with professional care, skill, and diligence</li>
                    <li style={styles.li}>Comply with all applicable laws, regulations, and professional standards</li>
                    <li style={styles.li}>Follow the Employer's policies, procedures, and protocols</li>
                    <li style={styles.li}>Maintain patient confidentiality and privacy per PIPEDA and applicable provincial laws</li>
                    <li style={styles.li}>Report any changes to licensing or credential status immediately</li>
                    <li style={styles.li}>Maintain professional liability insurance as required</li>
                </ul>
            </div>

            {/* 5. Obligations of the Employer */}
            <h2 style={styles.h2}>5. OBLIGATIONS OF THE EMPLOYER</h2>
            <div style={styles.section}>
                <p>The Employer agrees to:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Provide a safe and appropriate work environment</li>
                    <li style={styles.li}>Comply with all employment standards and labor laws</li>
                    <li style={styles.li}>Ensure workplace insurance and liability coverage</li>
                    <li style={styles.li}>Provide necessary equipment and resources for the Professional to perform their duties</li>
                    <li style={styles.li}>Pay compensation as agreed in a timely manner</li>
                    <li style={styles.li}>Maintain confidentiality of the Professional's personal information</li>
                </ul>
            </div>

            {/* 6. Confidentiality and Privacy */}
            <h2 style={styles.h2}>6. CONFIDENTIALITY AND PRIVACY</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>6.1 Patient Information</h3>
                <p>Both parties agree to comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and all applicable provincial privacy legislation regarding patient and personal information.</p>

                <h3 style={styles.h3}>6.2 Professional Information</h3>
                <p>The Employer agrees to maintain the confidentiality of the Professional's personal information, credentials, and employment details.</p>
            </div>

            {/* 7. Liability and Insurance */}
            <h2 style={styles.h2}>7. LIABILITY AND INSURANCE</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>7.1 Professional Liability</h3>
                <p>The Professional shall maintain professional liability insurance in amounts reasonably required for their profession and specialty.</p>

                <h3 style={styles.h3}>7.2 Workplace Insurance</h3>
                <p>The Employer shall maintain appropriate workplace liability insurance and workers' compensation coverage as required by law.</p>

                <h3 style={styles.h3}>7.3 Platform Disclaimer</h3>
                <p><strong>Important:</strong> QuickLocum Inc. is not a party to this employment agreement and assumes no liability for:</p>
                <ul style={styles.ul}>
                    <li style={styles.li}>Professional performance or conduct</li>
                    <li style={styles.li}>Employment disputes or workplace issues</li>
                    <li style={styles.li}>Professional liability or malpractice claims</li>
                    <li style={styles.li}>Payment disputes between parties</li>
                </ul>
            </div>

            {/* 8. Termination */}
            <h2 style={styles.h2}>8. TERMINATION</h2>
            <div style={styles.section}>
                <h3 style={styles.h3}>8.1 Termination with Notice</h3>
                <p>Either party may terminate this agreement with notice as required by applicable employment standards legislation or as otherwise agreed in writing.</p>

                <h3 style={styles.h3}>8.2 Termination for Cause</h3>
                <p>Either party may terminate immediately for cause, including but not limited to material breach of this agreement, professional misconduct, or violation of applicable laws.</p>

                <h3 style={styles.h3}>8.3 Effect on Platform Fees</h3>
                <p>Termination of this agreement does not affect the Employer's obligation to pay platform fees owed to QuickLocum Inc. for the initial placement.</p>
            </div>

            {/* 9. Governing Law */}
            <h2 style={styles.h2}>9. GOVERNING LAW</h2>
            <div style={styles.section}>
                <p>This Agreement shall be governed by and construed in accordance with the laws of the Province of <strong>{provinceLaw}</strong> and the federal laws of Canada applicable therein, including all applicable employment standards legislation.</p>
            </div>

            {/* 10. Entire Agreement */}
            <h2 style={styles.h2}>10. ENTIRE AGREEMENT</h2>
            <div style={styles.section}>
                <p>This Agreement, together with any written amendments and the job posting through which this position was advertised, constitutes the entire agreement between the parties.</p>
            </div>

            {/* 11. Acknowledgment */}
            <h2 style={styles.h2}>11. ACKNOWLEDGMENT</h2>
            <div style={styles.section}>
                <p><strong>BY SIGNING BELOW, BOTH PARTIES ACKNOWLEDGE THAT:</strong></p>
                <ul style={styles.ul}>
                    <li style={styles.li}>They have read, understood, and agree to all terms of this Agreement</li>
                    <li style={styles.li}>They have the authority to enter into this Agreement</li>
                    <li style={styles.li}>This constitutes a legally binding employment contract</li>
                    <li style={styles.li}>QuickLocum Inc. is not a party to this agreement and platform fees are governed separately</li>
                    <li style={styles.li}>Both parties will comply with all applicable laws and regulations</li>
                </ul>
            </div>

            {/* Signatures */}
            <div style={{ marginTop: '50px' }}>
                <h2 style={styles.h2}>SIGNATURES</h2>
                <p><em>By signing below with your electronic signature, you confirm your acceptance of this Agreement.</em></p>

                <div style={{ margin: '40px 0', padding: '20px', border: '1px solid #ddd', background: '#f8f9fa' }}>
                    <h3 style={styles.h3}>PROFESSIONAL</h3>
                    <p><strong>{professionalName}</strong></p>
                    <div style={{ borderBottom: '2px solid #333', minHeight: '80px', margin: '20px 0' }} id="agency-signature-container">
                        {/* Signature will be inserted here */}
                    </div>
                    <div id="agency-metadata">
                        {/* Signature metadata will be inserted here */}
                    </div>
                </div>

                <div style={{ margin: '40px 0', padding: '20px', border: '1px solid #ddd', background: '#f8f9fa' }}>
                    <h3 style={styles.h3}>EMPLOYER</h3>
                    <p><strong>{clinicName}</strong></p>
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
                <p>This employment agreement was facilitated through QuickLocum Inc.</p>
                <p>QuickLocum Inc. | www.quicklocum.ca | support@quicklocum.ca</p>
                <p><em>This is a legally binding agreement. Both parties should retain a copy for their records.</em></p>
            </div>
        </div>
    );
};

export default DirectHireAgreement;
