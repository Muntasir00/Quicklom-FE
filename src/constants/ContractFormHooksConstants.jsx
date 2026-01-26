// CONTRACT_TYPE "enum" 
import { CONTRACT_TYPE } from "@constants/ContractTypeConstants";


// Hooks
import { useGeneralDentistryTemporaryForm } from "@hooks/institute/contracts/useGeneralDentistryTemporaryForm";
import { usePharmacyTemporaryForm } from "@hooks/institute/contracts/usePharmacyTemporaryForm";
import { useGeneralPracticePermanentForm } from "@hooks/institute/contracts/useGeneralPracticePermanentForm";
import { useGeneralPracticeTemporaryForm } from "@hooks/institute/contracts/useGeneralPracticeTemporaryForm";
import { useNursingPermanentForm } from "@hooks/institute/contracts/useNursingPermanentForm";
import { useNursingTemporaryForm } from "@hooks/institute/contracts/useNursingTemporaryForm";
import { usePermanentStaffingDentalForm } from "@hooks/institute/contracts/usePermanentStaffingDentalForm";
import { usePermanentStaffingPharmacyForm } from "@hooks/institute/contracts/usePermanentStaffingPharmacyForm";
import { useSpecialtyDentistryForm } from "@hooks/institute/contracts/useSpecialtyDentistryForm";


// Hooks list
export const CONTRACT_FORM_HOOKS_LIST = {
    [CONTRACT_TYPE.GENERAL_DENTISTRY_TEMPORARY]: useGeneralDentistryTemporaryForm,
    [CONTRACT_TYPE.PHARMACY_TEMPORARY]: usePharmacyTemporaryForm,
    [CONTRACT_TYPE.GENERAL_PRACTICE_PERMANENT]: useGeneralPracticePermanentForm,
    [CONTRACT_TYPE.GENERAL_PRACTICE_TEMPORARY]: useGeneralPracticeTemporaryForm,
    [CONTRACT_TYPE.NURSING_PERMANENT]: useNursingPermanentForm,
    [CONTRACT_TYPE.NURSING_TEMPORARY]: useNursingTemporaryForm,
    [CONTRACT_TYPE.PERMANENT_STAFFING_DENTAL]: usePermanentStaffingDentalForm,
    [CONTRACT_TYPE.PERMANENT_STAFFING_PHARMACY]: usePermanentStaffingPharmacyForm,
    [CONTRACT_TYPE.SPECIALTY_DENTISTRY]: useSpecialtyDentistryForm,
};