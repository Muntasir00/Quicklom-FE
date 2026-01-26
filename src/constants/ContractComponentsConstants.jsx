// @constants/ContractComponents.js
import { CONTRACT_TYPE } from "@constants/ContractTypeConstants";


import GeneralDentistryTemporaryForm from "@components/forms/GeneralDentistryTemporaryForm";
import PharmacyTemporaryForm from "@components/forms/PharmacyTemporaryForm";
import GeneralPracticePermanentForm from "@components/forms/GeneralPracticePermanentForm";
import GeneralPracticeTemporaryForm from "@components/forms/GeneralPracticeTemporaryForm";
import NursingPermanentForm from "@components/forms/NursingPermanentForm";
import NursingTemporaryForm from "@components/forms/NursingTemporaryForm";
import PermanentStaffingDentalForm from "@components/forms/PermanentStaffingDentalForm";
import PermanentStaffingPharmacyForm from "@components/forms/PermanentStaffingPharmacyForm";
import SpecialtyDentistryForm from "@components/forms/SpecialtyDentistryForm";

export const CONTRACT_COMPONENTS_LIST = {
    [CONTRACT_TYPE.GENERAL_DENTISTRY_TEMPORARY]: GeneralDentistryTemporaryForm,
    [CONTRACT_TYPE.PHARMACY_TEMPORARY]: PharmacyTemporaryForm,
    [CONTRACT_TYPE.GENERAL_PRACTICE_PERMANENT]: GeneralPracticePermanentForm,
    [CONTRACT_TYPE.GENERAL_PRACTICE_TEMPORARY]: GeneralPracticeTemporaryForm,
    [CONTRACT_TYPE.NURSING_PERMANENT]: NursingPermanentForm,
    [CONTRACT_TYPE.NURSING_TEMPORARY]: NursingTemporaryForm,
    [CONTRACT_TYPE.PERMANENT_STAFFING_DENTAL]: PermanentStaffingDentalForm,
    [CONTRACT_TYPE.PERMANENT_STAFFING_PHARMACY]: PermanentStaffingPharmacyForm,
    [CONTRACT_TYPE.SPECIALTY_DENTISTRY]: SpecialtyDentistryForm,
};
