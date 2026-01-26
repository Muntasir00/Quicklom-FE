import React, { useState } from "react";

const TermsOfUse = () => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const [activeSection, setActiveSection] = useState(null);

    const sections = [
        { id: 1, title: "Definitions", icon: "fa-book" },
        { id: 2, title: "QuickLocum's Role", icon: "fa-building" },
        { id: 3, title: "User Roles & Permitted Actions", icon: "fa-users" },
        { id: 4, title: "Fees", icon: "fa-dollar-sign" },
        { id: 5, title: "User Agreements", icon: "fa-handshake" },
        { id: 6, title: "Background Checks", icon: "fa-search" },
        { id: 7, title: "Agency/Headhunter Obligations", icon: "fa-user-tie" },
        { id: 8, title: "Professional Obligations", icon: "fa-user-md" },
        { id: 9, title: "Client Obligations", icon: "fa-clinic-medical" },
        { id: 10, title: "Privacy & Data Protection", icon: "fa-shield-alt" },
        { id: 11, title: "Candidate Ownership Rules", icon: "fa-id-card" },
        { id: 12, title: "Prohibited Uses", icon: "fa-ban" },
        { id: 13, title: "Liability Limitations", icon: "fa-exclamation-triangle" },
        { id: 14, title: "Indemnification", icon: "fa-gavel" },
        { id: 15, title: "Dispute Resolution", icon: "fa-balance-scale" },
        { id: 16, title: "Suspension & Termination", icon: "fa-user-slash" },
        { id: 17, title: "Governing Law", icon: "fa-landmark" },
        { id: 18, title: "Amendments", icon: "fa-edit" },
        { id: 19, title: "Contact", icon: "fa-envelope" },
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(`section-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
        }
    };

    return (
        <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 57px)', background: '#f8fafc' }}>
            <style>{`
                .terms-page {
                    display: flex;
                    gap: 24px;
                    padding: 24px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .terms-sidebar {
                    width: 280px;
                    flex-shrink: 0;
                    position: sticky;
                    top: 80px;
                    height: fit-content;
                    max-height: calc(100vh - 120px);
                    overflow-y: auto;
                }

                .terms-sidebar::-webkit-scrollbar {
                    width: 4px;
                }

                .terms-sidebar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 2px;
                }

                .terms-nav {
                    background: white;
                    border-radius: 16px;
                    padding: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }

                .terms-nav-title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 8px 12px;
                    margin-bottom: 8px;
                }

                .terms-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.8rem;
                    color: #475569;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                }

                .terms-nav-item:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }

                .terms-nav-item.active {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                }

                .terms-nav-item i {
                    width: 20px;
                    text-align: center;
                    font-size: 0.75rem;
                }

                .terms-main {
                    flex: 1;
                    min-width: 0;
                }

                .terms-header {
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%);
                    border-radius: 20px;
                    padding: 32px;
                    margin-bottom: 24px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .terms-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .terms-header-content {
                    position: relative;
                    z-index: 1;
                }

                .terms-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 8px 0;
                }

                .terms-header p {
                    opacity: 0.9;
                    margin: 0;
                    font-size: 0.95rem;
                }

                .terms-header-meta {
                    display: flex;
                    gap: 20px;
                    margin-top: 16px;
                }

                .terms-header-meta span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    opacity: 0.9;
                }

                .terms-content-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }

                .terms-intro {
                    padding: 24px 32px;
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-bottom: 1px solid #fcd34d;
                }

                .terms-intro p {
                    margin: 0;
                    color: #92400e;
                    font-weight: 500;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .terms-intro i {
                    font-size: 1.2rem;
                    margin-top: 2px;
                }

                .terms-body {
                    padding: 32px;
                }

                .terms-section {
                    margin-bottom: 40px;
                    scroll-margin-top: 100px;
                }

                .terms-section:last-child {
                    margin-bottom: 0;
                }

                .terms-section-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 20px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #e2e8f0;
                }

                .terms-section-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .terms-section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .terms-section-number {
                    font-size: 0.75rem;
                    color: #6366f1;
                    font-weight: 600;
                }

                .terms-subsection {
                    margin: 20px 0;
                    padding-left: 58px;
                }

                .terms-subsection-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #334155;
                    margin: 0 0 12px 0;
                }

                .terms-text {
                    color: #475569;
                    line-height: 1.7;
                    margin-bottom: 12px;
                }

                .terms-text:last-child {
                    margin-bottom: 0;
                }

                .terms-list {
                    margin: 12px 0;
                    padding-left: 20px;
                }

                .terms-list li {
                    color: #475569;
                    line-height: 1.7;
                    margin-bottom: 8px;
                    position: relative;
                }

                .terms-list li::marker {
                    color: #6366f1;
                }

                .terms-highlight {
                    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
                    padding: 16px 20px;
                    border-radius: 12px;
                    border-left: 4px solid #8b5cf6;
                    margin: 16px 0;
                }

                .terms-highlight p {
                    margin: 0;
                    color: #5b21b6;
                    font-weight: 500;
                }

                .terms-warning {
                    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                    padding: 16px 20px;
                    border-radius: 12px;
                    border-left: 4px solid #ef4444;
                    margin: 16px 0;
                }

                .terms-warning p {
                    margin: 0;
                    color: #b91c1c;
                    font-weight: 500;
                }

                .terms-info {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    padding: 16px 20px;
                    border-radius: 12px;
                    border-left: 4px solid #3b82f6;
                    margin: 16px 0;
                }

                .terms-info p {
                    margin: 0;
                    color: #1e40af;
                    font-weight: 500;
                }

                .terms-contact-card {
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    padding: 24px;
                    border-radius: 16px;
                    border: 1px solid #86efac;
                }

                .terms-contact-card h4 {
                    margin: 0 0 16px 0;
                    color: #166534;
                    font-weight: 700;
                }

                .terms-contact-card a {
                    color: #15803d;
                    text-decoration: none;
                    font-weight: 500;
                }

                .terms-contact-card a:hover {
                    text-decoration: underline;
                }

                @media (max-width: 1024px) {
                    .terms-sidebar {
                        display: none;
                    }

                    .terms-page {
                        padding: 16px;
                    }

                    .terms-header {
                        padding: 24px;
                        border-radius: 16px;
                    }

                    .terms-header h1 {
                        font-size: 1.5rem;
                    }

                    .terms-body {
                        padding: 24px;
                    }

                    .terms-subsection {
                        padding-left: 0;
                    }
                }
            `}</style>

            <div className="terms-page" style={{ marginTop: '15px' }}>
                {/* Sidebar Navigation */}
                <div className="terms-sidebar">
                    <nav className="terms-nav">
                        <div className="terms-nav-title">
                            <i className="fas fa-list-ul mr-2"></i>
                            Table of Contents
                        </div>
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                className={`terms-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => scrollToSection(section.id)}
                            >
                                <i className={`fas ${section.icon}`}></i>
                                <span>{section.id}. {section.title}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="terms-main">
                    {/* Header */}
                    <div className="terms-header">
                        <div className="terms-header-content">
                            <h1><i className="fas fa-file-contract mr-3"></i>Terms of Use</h1>
                            <p>Please read these terms carefully before using the QuickLocum platform.</p>
                            <div className="terms-header-meta">
                                <span><i className="fas fa-calendar-alt"></i> Last Updated: {currentDate}</span>
                                <span><i className="fas fa-clock"></i> ~15 min read</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="terms-content-card">
                        {/* Important Notice */}
                        <div className="terms-intro">
                            <p>
                                <i className="fas fa-exclamation-circle"></i>
                                <span>These Terms of Use ("Terms") govern your access to and use of the QuickLocum platform. By creating an account or using the Platform, you agree to be bound by these Terms. <strong>If you do not agree, do not use the Platform.</strong></span>
                            </p>
                        </div>

                        <div className="terms-body">
                            {/* Section 1: Definitions */}
                            <section className="terms-section" id="section-1">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-book"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 1</div>
                                        <h2 className="terms-section-title">Definitions</h2>
                                    </div>
                                </div>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li><strong>"Professional"</strong> – Any healthcare worker seeking temporary or permanent work.</li>
                                    <li><strong>"Client"</strong> – Any clinic, pharmacy, healthcare institution, or business posting contracts or hiring professionals.</li>
                                    <li><strong>"Agency/Headhunter"</strong> – Any individual or organization that recruits, represents, or submits candidates on behalf of Professional(s).</li>
                                    <li><strong>"User(s)"</strong> – Any individual or entity using the Platform, including Professionals, Clients, and Agencies/Headhunters.</li>
                                    <li><strong>"Direct Hire"</strong> – A hire where the Client hires the Professional directly through the Platform without an intermediary agency/headhunter.</li>
                                    <li><strong>"Agency Hire"</strong> – A hire facilitated by an Agency/Headhunter.</li>
                                    <li><strong>"Agreement Between Users"</strong> – Any legally binding agreement formed between Professionals, Agencies/Headhunters, and/or Clients.</li>
                                    <li><strong>"Platform Fees"</strong> – Fees charged by QuickLocum to the Client and/or Agency/Headhunter for use of the Platform.</li>
                                </ul>
                            </section>

                            {/* Section 2: QuickLocum's Role */}
                            <section className="terms-section" id="section-2">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-building"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 2</div>
                                        <h2 className="terms-section-title">QuickLocum's Role</h2>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">2.1 Marketplace Platform Only</h3>
                                    <p className="terms-text">QuickLocum is not a recruitment agency, employer, or staffing firm.</p>
                                    <div className="terms-warning">
                                        <p><strong>We do not:</strong> employ Professionals, represent Professionals, negotiate on behalf of any User, become a party to any agreement between Users, or guarantee job outcomes, quality of work, or candidate performance.</p>
                                    </div>
                                    <p className="terms-text">We only provide tools for Users to connect, communicate, exchange information, and enter into independent agreements.</p>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">2.2 No Employment Relationship</h3>
                                    <p className="terms-text">Using the Platform does not create an employer–employee, principal–agent, or partnership relationship between QuickLocum and any User.</p>
                                </div>
                            </section>

                            {/* Section 3: User Roles */}
                            <section className="terms-section" id="section-3">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 3</div>
                                        <h2 className="terms-section-title">User Roles & Permitted Actions</h2>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">3.1 Professionals</h3>
                                    <p className="terms-text"><strong>Professionals may:</strong></p>
                                    <ul className="terms-list">
                                        <li>Create a profile</li>
                                        <li>Apply to contracts posted by Clients or Agencies/Headhunters</li>
                                        <li>Enter into Direct Hire agreements</li>
                                        <li>Communicate with Clients or Agencies</li>
                                        <li>Provide credentials for verification</li>
                                    </ul>
                                    <div className="terms-highlight">
                                        <p><i className="fas fa-check-circle mr-2"></i>Professionals cannot be charged fees by QuickLocum.</p>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">3.2 Clients (Clinics, Pharmacies, Institutions)</h3>
                                    <p className="terms-text"><strong>Clients may:</strong></p>
                                    <ul className="terms-list">
                                        <li>Publish contracts</li>
                                        <li>Hire Professionals directly (Direct Hire)</li>
                                        <li>Hire through Agencies/Headhunters</li>
                                        <li>Be charged platform fees</li>
                                    </ul>
                                    <div className="terms-info">
                                        <p><i className="fas fa-info-circle mr-2"></i>Clients cannot apply to contracts.</p>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">3.3 Agencies/Headhunters</h3>
                                    <p className="terms-text"><strong>Agencies/Headhunters may:</strong></p>
                                    <ul className="terms-list">
                                        <li>Publish contracts</li>
                                        <li>Apply to contracts published by Clients or other Agencies/Headhunters</li>
                                        <li>Submit Professionals (with prior consent)</li>
                                        <li>Enter into agreements with Clients or other Agencies</li>
                                    </ul>
                                    <div className="terms-info">
                                        <p><i className="fas fa-info-circle mr-2"></i>Agencies/Headhunters are subject to platform fees.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4: Fees */}
                            <section className="terms-section" id="section-4">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-dollar-sign"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 4</div>
                                        <h2 className="terms-section-title">Fees</h2>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">4.1 Platform Fees</h3>
                                    <p className="terms-text">Clients and Agencies/Headhunters agree to pay all applicable Platform Fees as outlined in their Platform Services Agreement (PSA).</p>
                                    <div className="terms-highlight">
                                        <p><i className="fas fa-check-circle mr-2"></i>Professionals are never charged.</p>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">4.2 Direct Hire Fees</h3>
                                    <p className="terms-text">For Direct Hire placements, Clients agree to pay a <strong>10% service fee</strong> based on the contract value. This fee is not deducted from the Professional's earnings.</p>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">4.3 Agency/Headhunter Fees</h3>
                                    <p className="terms-text">Agency fees offered to Clients must be disclosed directly in the agreement between those parties.</p>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">4.4 No Refunds</h3>
                                    <div className="terms-warning">
                                        <p><i className="fas fa-exclamation-triangle mr-2"></i>Platform fees are non-refundable, except where required by Canadian law or explicitly stated in the PSA.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5: User Agreements */}
                            <section className="terms-section" id="section-5">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-handshake"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 5</div>
                                        <h2 className="terms-section-title">User Agreements Between Themselves</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}><strong>Users acknowledge that:</strong></p>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li>QuickLocum does not draft or negotiate their agreements</li>
                                    <li>QuickLocum is not responsible for enforcing agreement terms</li>
                                    <li>All obligations (fees, commissions, replacements, guarantees, liability) lie solely between Users</li>
                                    <li>Each User is responsible for reviewing, modifying, signing, and enforcing their agreements</li>
                                </ul>
                            </section>

                            {/* Section 6: Background Checks */}
                            <section className="terms-section" id="section-6">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 6</div>
                                        <h2 className="terms-section-title">Background Checks</h2>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">6.1 Direct Hire Only</h3>
                                    <p className="terms-text">QuickLocum may facilitate background checks only for Direct Hire placements.</p>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">6.2 Limitations</h3>
                                    <div className="terms-warning">
                                        <p><strong>QuickLocum:</strong> does not guarantee the accuracy of background check information, is not liable for omissions, delays, or third-party errors, and does not vet or certify Professionals, Clients, or Agencies.</p>
                                    </div>
                                    <p className="terms-text"><strong>Clients remain solely responsible for determining the suitability of Professionals.</strong></p>
                                </div>
                            </section>

                            {/* Section 7: Agency Obligations */}
                            <section className="terms-section" id="section-7">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-user-tie"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 7</div>
                                        <h2 className="terms-section-title">Agency/Headhunter Obligations</h2>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">7.1 Candidate Consent Required</h3>
                                    <p className="terms-text">Agencies/Headhunters must obtain explicit written consent from Professionals before submitting them for any contract.</p>
                                    <div className="terms-warning">
                                        <p><i className="fas fa-exclamation-triangle mr-2"></i>A breach of this obligation may result in: suspension, termination, or legal liability under privacy laws.</p>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">7.2 Accuracy of Representations</h3>
                                    <p className="terms-text"><strong>Agencies must:</strong></p>
                                    <ul className="terms-list">
                                        <li>Provide accurate candidate information</li>
                                        <li>Comply with all applicable employment and recruitment regulations</li>
                                        <li>Avoid submitting candidates without their approval ("candidate poaching")</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 8: Professional Obligations */}
                            <section className="terms-section" id="section-8">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-user-md"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 8</div>
                                        <h2 className="terms-section-title">Professional Obligations</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}><strong>Professionals must:</strong></p>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li>Provide accurate credentials</li>
                                    <li>Maintain valid licenses</li>
                                    <li>Notify Clients/Agencies of any changes to their license status</li>
                                    <li>Comply with all employment laws and workplace rules</li>
                                </ul>
                            </section>

                            {/* Section 9: Client Obligations */}
                            <section className="terms-section" id="section-9">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-clinic-medical"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 9</div>
                                        <h2 className="terms-section-title">Client Obligations</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}><strong>Clients must:</strong></p>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li>Pay agreed fees to Agencies and QuickLocum</li>
                                    <li>Provide a safe and compliant workplace</li>
                                    <li>Follow relevant Canadian healthcare regulations</li>
                                    <li>Respect privacy and confidentiality</li>
                                    <li>Complete payment obligations even if disputes arise</li>
                                </ul>
                            </section>

                            {/* Section 10: Privacy */}
                            <section className="terms-section" id="section-10">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-shield-alt"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 10</div>
                                        <h2 className="terms-section-title">Privacy & Data Protection</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}><strong>Users agree to comply with:</strong></p>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li>PIPEDA (federal)</li>
                                    <li>Relevant provincial privacy laws</li>
                                    <li>Health sector privacy rules (where applicable)</li>
                                </ul>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}>QuickLocum collects and processes personal information as described in its Privacy Policy.</p>
                                <div className="terms-warning" style={{ marginLeft: '58px' }}>
                                    <p><i className="fas fa-lock mr-2"></i>Users must not misuse personal data obtained through the Platform.</p>
                                </div>
                            </section>

                            {/* Section 11: Candidate Ownership */}
                            <section className="terms-section" id="section-11">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-id-card"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 11</div>
                                        <h2 className="terms-section-title">Candidate Ownership Rules</h2>
                                    </div>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">11.1 Multi-Agency Submissions</h3>
                                    <p className="terms-text">Candidate ownership applies only for submissions to the same Client. QuickLocum does not enforce candidate ownership across different clients.</p>
                                </div>
                                <div className="terms-subsection">
                                    <h3 className="terms-subsection-title">11.2 Competing Submissions</h3>
                                    <p className="terms-text">If multiple Agencies submit the same Professional to the same Client:</p>
                                    <ul className="terms-list">
                                        <li>QuickLocum may notify each party</li>
                                        <li>The Client decides which submission is accepted</li>
                                        <li>QuickLocum is not responsible for disputes</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 12: Prohibited Uses */}
                            <section className="terms-section" id="section-12">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                                        <i className="fas fa-ban"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 12</div>
                                        <h2 className="terms-section-title">Prohibited Uses</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}><strong>Users must not:</strong></p>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li>Impersonate others</li>
                                    <li>Post false or misleading job listings</li>
                                    <li>Misrepresent credentials or candidate consent</li>
                                    <li>Spam or harass other Users</li>
                                    <li>Attempt to bypass the Platform to avoid fees ("circumvention")</li>
                                    <li>Upload malware or attempt to breach security</li>
                                    <li>Use the Platform for unlawful activities</li>
                                </ul>
                                <div className="terms-warning" style={{ marginLeft: '58px' }}>
                                    <p><i className="fas fa-gavel mr-2"></i>Violations may lead to suspension or termination.</p>
                                </div>
                            </section>

                            {/* Section 13: Liability */}
                            <section className="terms-section" id="section-13">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 13</div>
                                        <h2 className="terms-section-title">Liability Limitations</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}><strong>To the fullest extent permitted by law:</strong></p>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li>QuickLocum is not liable for any employment, performance, or contract disputes</li>
                                    <li>QuickLocum is not liable for negligence, misconduct, termination, injuries, or malpractice</li>
                                    <li>QuickLocum does not guarantee the accuracy of information provided by Users</li>
                                    <li>QuickLocum is not responsible for failure of background checks or credential validation</li>
                                    <li>QuickLocum's total liability is limited to the amount of Platform Fees paid in the last 12 months</li>
                                </ul>
                            </section>

                            {/* Section 14: Indemnification */}
                            <section className="terms-section" id="section-14">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-gavel"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 14</div>
                                        <h2 className="terms-section-title">Indemnification</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}>Users agree to indemnify and hold harmless QuickLocum from any claims, damages, liabilities, and legal costs arising from actions, omissions, or violations by the User.</p>
                            </section>

                            {/* Section 15: Dispute Resolution */}
                            <section className="terms-section" id="section-15">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-balance-scale"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 15</div>
                                        <h2 className="terms-section-title">Dispute Resolution</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}><strong>Users must attempt resolution through:</strong></p>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li>Good-faith negotiation</li>
                                    <li>Mediation</li>
                                    <li>Binding arbitration in the Province of Ontario</li>
                                </ul>
                                <div className="terms-warning" style={{ marginLeft: '58px' }}>
                                    <p><i className="fas fa-users-slash mr-2"></i>Class actions are not permitted.</p>
                                </div>
                            </section>

                            {/* Section 16: Suspension */}
                            <section className="terms-section" id="section-16">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                                        <i className="fas fa-user-slash"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 16</div>
                                        <h2 className="terms-section-title">Suspension & Termination</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}><strong>We may suspend or terminate accounts if Users:</strong></p>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li>Violate these Terms</li>
                                    <li>Misuse data</li>
                                    <li>Misrepresent candidate consent</li>
                                    <li>Refuse to pay applicable fees</li>
                                    <li>Engage in circumvention</li>
                                    <li>Harm the integrity of the Platform</li>
                                </ul>
                            </section>

                            {/* Section 17: Governing Law */}
                            <section className="terms-section" id="section-17">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-landmark"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 17</div>
                                        <h2 className="terms-section-title">Governing Law</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}><strong>These Terms are governed by the laws of:</strong></p>
                                <ul className="terms-list" style={{ paddingLeft: '78px' }}>
                                    <li>The Province of Ontario, and</li>
                                    <li>Federal laws of Canada</li>
                                </ul>
                            </section>

                            {/* Section 18: Amendments */}
                            <section className="terms-section" id="section-18">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon">
                                        <i className="fas fa-edit"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 18</div>
                                        <h2 className="terms-section-title">Amendments</h2>
                                    </div>
                                </div>
                                <p className="terms-text" style={{ paddingLeft: '58px' }}>QuickLocum may update these Terms at any time. Your continued use of the Platform constitutes acceptance of the updated Terms.</p>
                            </section>

                            {/* Section 19: Contact */}
                            <section className="terms-section" id="section-19">
                                <div className="terms-section-header">
                                    <div className="terms-section-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div>
                                        <div className="terms-section-number">Section 19</div>
                                        <h2 className="terms-section-title">Contact</h2>
                                    </div>
                                </div>
                                <div className="terms-contact-card" style={{ marginLeft: '58px' }}>
                                    <h4><i className="fas fa-building mr-2"></i>QuickLocum Inc.</h4>
                                    <p style={{ margin: '8px 0', color: '#166534' }}>
                                        <i className="fas fa-globe mr-2"></i>
                                        Website: <a href="https://www.quicklocum.ca" target="_blank" rel="noopener noreferrer">www.quicklocum.ca</a>
                                    </p>
                                    <p style={{ margin: '8px 0', color: '#166534' }}>
                                        <i className="fas fa-envelope mr-2"></i>
                                        Email: <a href="mailto:support@quicklocum.ca">support@quicklocum.ca</a>
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;
