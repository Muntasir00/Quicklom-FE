import {Routes, Route} from 'react-router-dom';

// admin imports
import Dashboard from '../pages/admin/dashboard/View';
import ViewUsers from '../pages/admin/user/View';
import CreateUsers from '../pages/admin/user/Create';
import EditUsers from '../pages/admin/user/Edit';
import ViewUserProfile from '../pages/admin/user/ViewUserProfile';
import EditUserProfile from '../pages/admin/user/EditUserProfile';
import EditAccount from '../pages/admin/account/Edit';
import Login from '../pages/admin/auth/Login';
import ViewLogs from '../pages/admin/action-logs/View';

import AdminProfessionalCategories from '../pages/admin/professional-categories/View';
import AdminCreateProfessionalCategories from '../pages/admin/professional-categories/Create';
import AdminEditProfessionalCategories from '../pages/admin/professional-categories/Edit';

import AdminInstituteCategories from '../pages/admin/institute-categories/View';
import AdminCreateInstituteCategories from '../pages/admin/institute-categories/Create';
import AdminEditInstituteCategories from '../pages/admin/institute-categories/Edit';

import AdminProfessionalRoles from '../pages/admin/professional-roles/View';
import AdminCreateProfessionalRoles from '../pages/admin/professional-roles/Create';
import AdminEditProfessionalRoles from '../pages/admin/professional-roles/Edit';

import AdminInstituteSpecialties from '../pages/admin/institute-specialties/View';
import AdminCreateInstituteSpecialties from '../pages/admin/institute-specialties/Create';
import AdminEditInstituteSpecialties from '../pages/admin/institute-specialties/Edit';

import AdminPermissions from '../pages/admin/permissions/View';
import AdminCreatePermission from '../pages/admin/permissions/Create';
import AdminEditPermission from '../pages/admin/permissions/Edit';

import AdminRoles from '../pages/admin/roles/View';
import AdminCreateRole from '../pages/admin/roles/Create';
import AdminEditRole from '../pages/admin/roles/Edit';

import AdminInsuranceCompanies from '../pages/admin/insurance-companies/View';
import AdminCreateInsuranceCompany from '../pages/admin/insurance-companies/Create';
import AdminEditInsuranceCompany from '../pages/admin/insurance-companies/Edit';

import AdminContractTypes from '@pages/admin/contract-types/View';
import AdminCreateContractType from '@pages/admin/contract-types/Create';
import AdminEditContractType from '@pages/admin/contract-types/Edit';

import AdminContracts from '@pages/admin/contracts/View';
import AdminCreateContract from '@pages/admin/contracts/Create';
import AdminEditContract from '@pages/admin/contracts/Edit';

import AdminPositionSoughts from '@pages/admin/position-soughts/View';
import AdminCreatePositionSought from '@pages/admin/position-soughts/Create';
import AdminEditPositionSought from '@pages/admin/position-soughts/Edit';

import AdminMessages from '@pages/admin/messaging/View';
import AdminCreateMessage from '@pages/admin/messaging/Create';
import AdminEditMessage from '@pages/admin/messaging/Edit';
import AdminShowMessage from '@pages/admin/messaging/Show';


import AdminContacts from '@pages/admin/contacts/View';
import AdminNotifications from '@pages/admin/notifications/View';

import AdminInvoiceDashboard from '@pages/admin/billing/InvoiceDashboard';
import AdminAgreementDashboard from '@pages/admin/agreements/AgreementDashboard';
import AdminUpcomingContracts from '@pages/admin/upcoming-contracts/UpcomingContracts';
import AdminCommissionDashboard from '@pages/admin/commissions/CommissionDashboard';
import AdminCancellationDashboard from '@pages/admin/cancellations/CancellationDashboard';

// user imports
import UserLogin from '../pages/user/auth/Login';
import UserRegister from '../pages/user/auth/Register';
import UserEditAccount from '../pages/user/account/Edit';

// Professional imports
import ProfessionalDashboard from '../pages/professional/dashboard/View';
import ProfessionalProfile from '../pages/professional/profile/View';
import ProfessionalEditProfile from '../pages/professional/profile/Edit';
import ProfessionalPublishedContracts from '@pages/professional/published-contracts/View';
import ProfessionalContractApplications from '@pages/professional/contract-applications/View';
import ProfessionalCancellationFees from '../pages/professional/cancellation-fees/View';

import ProfessionalMessages from '@pages/professional/messaging/View';
import ProfessionalCreateMessage from '@pages/professional/messaging/Create';
import ProfessionalEditMessage from '@pages/professional/messaging/Edit';

import ProfessionalContacts from '@pages/professional/contacts/View';
import ProfessionalNotifications from '@pages/professional/notifications/View';
import ProfessionalTermsOfUse from '@pages/professional/terms-of-use/View';

// Professional Agreement imports
import ProfessionalAgreementDashboard from '@pages/professional/agreements/professional_agreement_dashboard.jsx';
import ProfessionalAgreementSignature from '@pages/professional/agreements/Professional_agreement_signature.jsx';

// Professional Upcoming Contracts
import ProfessionalUpcomingContracts from '@pages/professional/upcoming_contracts/upcoming_contracts';

// Professional Availability
import ProfessionalAvailability from '@pages/professional/availability/View';


// Institute imports
import InstituteDashboard from '../pages/institute/dashboard/View';
import InstituteEditProfile from '../pages/institute/profile/Edit';

import InstituteContracts from '@pages/institute/contracts/View';
import InstituteCreateContract from '@pages/institute/contracts/Create';
import InstituteEditContract from '@pages/institute/contracts/Edit';

import InstitutePublishedContracts from '@pages/institute/published-contracts/View';
import InstituteContractApplications from '@pages/institute/contract-applications/View';
import InstituteContractApplicants from '@pages/institute/contract-applicants/View';

import InstituteMessages from '@pages/institute/messaging/View';
import InstituteCreateMessage from '@pages/institute/messaging/Create';
import InstituteEditMessage from '@pages/institute/messaging/Edit';

import InstituteContacts from '@pages/institute/contacts/View';
import InstituteNotifications from '@pages/institute/notifications/View';
import InstituteTermsOfUse from '@pages/institute/terms-of-use/View';

// Institute Billing & Agreement imports
import BillingDashboard from '@pages/institute/billing/BillingDashboard';
import PaymentHistory from '@pages/institute/billing/PaymentHistory';
import InvoiceDashboard from '@pages/institute/billing/InvoiceDashboard';
import InstituteAgreementDashboard from '@pages/institute/agreement/AgreementDashboard';
import InstituteAgreementSignature from '@pages/institute/agreement/AgreementSignature';
import InstituteAgreementSignatureFullWidth from '@pages/institute/agreement/AgreementSignatureFullWidth';

// Institute Upcoming Contracts
import InstituteUpcomingContracts from '@pages/institute/upcoming_contracts/upcoming_contracts';


function MyRouter() {
    return (
        <Routes>
            <Route path='/login' element={<UserLogin/>}/>
            <Route path='/register' element={<UserRegister/>}/>

            <Route path='/admin' element="">
                <Route path='login' element={<Login/>}/>
                <Route path="dashboard" element={<Dashboard/>}/>
                <Route path="account" element={<EditAccount/>}/>
                <Route path="action-logs" element={<ViewLogs/>}/>

                {/* User Management Routes */}
                <Route path="users" element={<ViewUsers/>}/>
                <Route path="users/create" element={<CreateUsers/>}/>
                <Route path="users/:id/edit" element={<EditUsers/>}/>
                {/* User Profile Management Routes */}
                <Route path="users/:id/profile/view" element={<ViewUserProfile/>}/>
                <Route path="users/:id/profile/edit" element={<EditUserProfile/>}/>

                <Route path="professional-categories" element={<AdminProfessionalCategories/>}/>
                <Route path="professional-categories/create" element={<AdminCreateProfessionalCategories/>}/>
                <Route path="professional-categories/:id/edit" element={<AdminEditProfessionalCategories/>}/>

                <Route path="institute-categories" element={<AdminInstituteCategories/>}/>
                <Route path="institute-categories/create" element={<AdminCreateInstituteCategories/>}/>
                <Route path="institute-categories/:id/edit" element={<AdminEditInstituteCategories/>}/>

                <Route path="professional-roles" element={<AdminProfessionalRoles/>}/>
                <Route path="professional-roles/create" element={<AdminCreateProfessionalRoles/>}/>
                <Route path="professional-roles/:id/edit" element={<AdminEditProfessionalRoles/>}/>

                <Route path="institute-specialties" element={<AdminInstituteSpecialties/>}/>
                <Route path="institute-specialties/create" element={<AdminCreateInstituteSpecialties/>}/>
                <Route path="institute-specialties/:id/edit" element={<AdminEditInstituteSpecialties/>}/>

                <Route path="permissions" element={<AdminPermissions/>}/>
                <Route path="permissions/create" element={<AdminCreatePermission/>}/>
                <Route path="permissions/:id/edit" element={<AdminEditPermission/>}/>

                <Route path="roles" element={<AdminRoles/>}/>
                <Route path="roles/create" element={<AdminCreateRole/>}/>
                <Route path="roles/:id/edit" element={<AdminEditRole/>}/>

                <Route path="insurance-companies" element={<AdminInsuranceCompanies/>}/>
                <Route path="insurance-companies/create" element={<AdminCreateInsuranceCompany/>}/>
                <Route path="insurance-companies/:id/edit" element={<AdminEditInsuranceCompany/>}/>

                <Route path="contract-types" element={<AdminContractTypes/>}/>
                <Route path="contract-types/create" element={<AdminCreateContractType/>}/>
                <Route path="contract-types/:id/edit" element={<AdminEditContractType/>}/>

                <Route path="contracts" element={<AdminContracts/>}/>
                <Route path="contracts/create" element={<AdminCreateContract/>}/>
                <Route path="contracts/:id/edit" element={<AdminEditContract/>}/>

                <Route path="position-soughts" element={<AdminPositionSoughts/>}/>
                <Route path="position-soughts/create" element={<AdminCreatePositionSought/>}/>
                <Route path="position-soughts/:id/edit" element={<AdminEditPositionSought/>}/>

                <Route path="messaging" element={<AdminCreateMessage/>}/>
                <Route path="messaging/users" element={<AdminMessages/>}/>
                <Route path="messaging/user/:id/create" element={<AdminCreateMessage/>}/>
                <Route path="messaging/monitor/:user1Id/:user2Id" element={<AdminCreateMessage/>}/>
                <Route path="messaging/:messageId/user/:id/edit" element={<AdminEditMessage/>}/>
                <Route path="messaging/users/:receiverId/:senderId/show" element={<AdminShowMessage/>}/>


                <Route path="contacts" element={<AdminContacts/>}/>
                <Route path="notifications" element={<AdminNotifications/>}/>

                <Route path="billing/invoices" element={<AdminInvoiceDashboard/>}/>
                <Route path="billing/commissions" element={<AdminCommissionDashboard/>}/>
                <Route path="cancellations" element={<AdminCancellationDashboard/>}/>
                <Route path="agreements" element={<AdminAgreementDashboard/>}/>
                <Route path="upcoming-contracts" element={<AdminUpcomingContracts/>}/>

            </Route>

            <Route path='/professional' element="">
                <Route path="dashboard" element={<ProfessionalDashboard/>}/>
                <Route path="account" element={<UserEditAccount/>}/>
                <Route path="profile" element={<ProfessionalProfile/>}/>
                <Route path="profile/:id/edit" element={<ProfessionalEditProfile/>}/>

                <Route path="published-contracts" element={<ProfessionalPublishedContracts/>}/>
                <Route path="contract-applications" element={<ProfessionalContractApplications/>}/>
                <Route path="cancellation-fees" element={<ProfessionalCancellationFees/>}/>

                {/* Professional Agreement Routes */}
                <Route path="agreements" element={<ProfessionalAgreementDashboard/>}/>
                <Route path="agreements/:agreementId" element={<ProfessionalAgreementSignature/>}/>
                <Route path="agreements/:agreementId/sign" element={<ProfessionalAgreementSignature/>}/>

                {/* Professional Upcoming Contracts Route */}
                <Route path="upcoming-contracts" element={<ProfessionalUpcomingContracts/>}/>

                {/* Professional Availability Route */}
                <Route path="availability" element={<ProfessionalAvailability/>}/>

                <Route path="messaging" element={<ProfessionalCreateMessage/>}/>
                <Route path="messaging/user/:id/create" element={<ProfessionalCreateMessage/>}/>
                <Route path="messaging/:messageId/user/:id/edit" element={<ProfessionalEditMessage/>}/>

                <Route path="contacts" element={<ProfessionalContacts/>}/>
                <Route path="notifications" element={<ProfessionalNotifications/>}/>
                <Route path="terms-of-use" element={<ProfessionalTermsOfUse/>}/>
            </Route>

            <Route path='/institute' element="">
                <Route path="dashboard" element={<InstituteDashboard/>}/>
                <Route path="account" element={<UserEditAccount/>}/>
                <Route path="profile/:id/edit" element={<InstituteEditProfile/>}/>

                <Route path="contracts" element={<InstituteContracts/>}/>
                <Route path="contracts/create" element={<InstituteCreateContract/>}/>
                <Route path="contracts/:id/edit" element={<InstituteEditContract/>}/>

                <Route path="published-contracts" element={<InstitutePublishedContracts/>}/>
                <Route path="contract-applications" element={<InstituteContractApplications/>}/>
                <Route path="contract-applicants" element={<InstituteContractApplicants/>}/>

                {/* Institute Upcoming Contracts Route */}
                <Route path="upcoming-contracts" element={<InstituteUpcomingContracts/>}/>

                <Route path="messaging" element={<InstituteCreateMessage/>}/>
                <Route path="messaging/user/:id/create" element={<InstituteCreateMessage/>}/>
                <Route path="messaging/:messageId/user/:id/edit" element={<InstituteEditMessage/>}/>

                <Route path="contacts" element={<InstituteContacts/>}/>
                <Route path="notifications" element={<InstituteNotifications/>}/>
                <Route path="terms-of-use" element={<InstituteTermsOfUse/>}/>

                {/* Institute Billing & Agreement Routes */}
                <Route path="billing" element={<BillingDashboard/>}/>
                <Route path="billing/history" element={<PaymentHistory/>}/>
                <Route path="billing/invoices" element={<InvoiceDashboard/>}/>
                <Route path="agreements" element={<InstituteAgreementDashboard/>}/>
                <Route path="agreements/:agreementId" element={<InstituteAgreementSignature/>}/>
                <Route path="agreements/:agreementId/sign" element={<InstituteAgreementSignature/>}/>
                <Route path="agreements/:agreementId/sign-fullwidth" element={<InstituteAgreementSignatureFullWidth/>}/>
            </Route>
        </Routes>
    );
}

export default MyRouter;