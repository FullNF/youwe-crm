import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { OPTIONS } from '../../constants/options';
import { createLead, updateLead, checkDuplicatePhone } from '../../hooks/useLeads';

const EMPTY = {
  customerName: '', contactDetails: '', buyOrRent: 'Buy', custType: 'Individual',
  leadCreatedDate: '', areaNeed: '', propertyCondition: '', configuration: '',
  bidPricePurchase: '', bidPriceRent: '', leadManagedBy: '', visitedDate: '',
  visitStatus: 'Pending', leadStage: 'New', needLoan: 'No', leadRemark: '',
  nextFollowUpDate: '', lastContactDate: '', leadSource: '', priority: 'Warm', assignedAgent: '',
};

export default function LeadFormModal({ open, onClose, lead, onSaved }) {
  const isEdit = Boolean(lead);
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: EMPTY });
  const [dupeWarning, setDupeWarning] = useState(null);

  useEffect(() => {
    if (open) reset(lead ? { ...EMPTY, ...lead } : EMPTY);
    setDupeWarning(null);
  }, [open, lead, reset]);

  const contactValue = watch('contactDetails');

  const handlePhoneBlur = async () => {
    if (!contactValue) return;
    try {
      const dupes = await checkDuplicatePhone(contactValue, lead?.recordId);
      if (dupes.length > 0) {
        setDupeWarning(`This number already exists for: ${dupes.map((d) => d.customerName).join(', ')}`);
      } else {
        setDupeWarning(null);
      }
    } catch {
      // non-blocking
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const updated = await updateLead(lead.recordId, data);
        toast.success('Lead updated');
        onSaved?.(updated);
      } else {
        const created = await createLead(data);
        toast.success('Lead created');
        onSaved?.(created);
      }
      onClose();
    } catch (err) {
      // toast already shown by axios interceptor
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Lead' : 'Add Lead'} width="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Customer Name" required error={errors.customerName?.message} {...register('customerName', { required: 'Required' })} />
          <div>
            <Input
              label="Contact Number"
              required
              error={errors.contactDetails?.message}
              {...register('contactDetails', { required: 'Required', onBlur: handlePhoneBlur })}
            />
            {dupeWarning && <p className="text-xs text-amber mt-1">⚠ {dupeWarning}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Buy or Rent" options={OPTIONS.BUY_OR_RENT} {...register('buyOrRent')} />
          <Select label="Customer Type" options={OPTIONS.CUST_TYPE} {...register('custType')} />
        </div>
        {/* Lead Created Date is intentionally not asked here - new leads are
            auto-stamped with today's date server-side (see leads.repository.js
            `create()`). Editing an existing lead keeps its original date,
            since this field stays in the form's default values untouched. */}

        <Input label="Area Need" placeholder="e.g. Sec. 70, Pyramid Altia and Nearby" {...register('areaNeed')} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Property Condition" options={OPTIONS.PROPERTY_CONDITION} {...register('propertyCondition')} />
          <Select label="Configuration" options={OPTIONS.CONFIGURATION} {...register('configuration')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Budget / Bid Price (Purchase)" placeholder="e.g. 85Lac-1Cr." {...register('bidPricePurchase')} />
          <Input label="Budget / Bid Price (Rent)" placeholder="e.g. ₹20,000" {...register('bidPriceRent')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Lead Managed By" {...register('leadManagedBy')} />
          <Input label="Visited Date" type="date" {...register('visitedDate')} />
          <Select label="Visit Status" options={OPTIONS.VISIT_STATUS} {...register('visitStatus')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Lead Stage" options={OPTIONS.LEAD_STAGE} {...register('leadStage')} />
          <Select label="Need Loan" options={OPTIONS.NEED_LOAN} {...register('needLoan')} />
          <Select label="Priority" options={OPTIONS.PRIORITY} {...register('priority')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Lead Source" options={OPTIONS.LEAD_SOURCE} {...register('leadSource')} />
          <Input label="Next Follow-up Date" type="date" {...register('nextFollowUpDate')} />
          <Input label="Last Contact Date" type="date" {...register('lastContactDate')} />
        </div>

        <Input label="Assigned Agent" {...register('assignedAgent')} />

        <Textarea
          label={isEdit ? 'Add a remark (appended to timeline, never overwrites history)' : 'Initial Remark'}
          placeholder="What happened in this conversation?"
          {...register('leadRemark')}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Lead'}</Button>
        </div>
      </form>
    </Modal>
  );
}
