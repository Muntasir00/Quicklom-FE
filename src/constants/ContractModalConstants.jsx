// @constants/ContractComponents.js
import { CONTRACT_TYPE } from "@constants/ContractTypeConstants";


import GeneralDentistryTemporaryModal from "@components/modals/GeneralDentistryTemporaryModal";
import PharmacyTemporaryModal from "@components/modals/PharmacyTemporaryModal";
import GeneralPracticePermanentModal from "@components/modals/GeneralPracticePermanentModal";
import GeneralPracticeTemporaryModal from "@components/modals/GeneralPracticeTemporaryModal";   
import NursingPermanentModal from "@components/modals/NursingPermanentModal";
import NursingTemporaryModal from "@components/modals/NursingTemporaryModal";
import PermanentStaffingDentalModal from "@components/modals/PermanentStaffingDentalModal";
import PermanentStaffingPharmacyModal from "@components/modals/PermanentStaffingPharmacyModal";
import SpecialtyDentistryModal from "@components/modals/SpecialtyDentistryModal";


export const CONTRACT_MODAL_COMPONENTS_LIST = {
    [CONTRACT_TYPE.GENERAL_DENTISTRY_TEMPORARY]: GeneralDentistryTemporaryModal,
    [CONTRACT_TYPE.PHARMACY_TEMPORARY]: PharmacyTemporaryModal,
    [CONTRACT_TYPE.GENERAL_PRACTICE_PERMANENT]: GeneralPracticePermanentModal,
    [CONTRACT_TYPE.GENERAL_PRACTICE_TEMPORARY]: GeneralPracticeTemporaryModal,
    [CONTRACT_TYPE.NURSING_PERMANENT]: NursingPermanentModal,
    [CONTRACT_TYPE.NURSING_TEMPORARY]: NursingTemporaryModal,
    [CONTRACT_TYPE.PERMANENT_STAFFING_DENTAL]: PermanentStaffingDentalModal,
    [CONTRACT_TYPE.PERMANENT_STAFFING_PHARMACY]: PermanentStaffingPharmacyModal,
    [CONTRACT_TYPE.SPECIALTY_DENTISTRY]: SpecialtyDentistryModal,
};
