import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { OPTIONS } from '../../constants/options';
import { createProperty, updateProperty } from '../../hooks/useProperties';

const EMPTY = { name: '', location: '', propertyType: '', description: '', media: [{ mediaType: 'Photo', driveLink: '', caption: '' }] };

export default function PropertyFormModal({ open, property, onClose, onSaved }) {
  const isEdit = Boolean(property);
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({ defaultValues: EMPTY });
  const { fields, append, remove } = useFieldArray({ control, name: 'media' });

  useEffect(() => {
    if (open) {
      reset(property ? { ...EMPTY, ...property, media: [] } : EMPTY);
    }
  }, [open, property, reset]);

  const onSubmit = async (data) => {
    try {
      const validMedia = (data.media || []).filter((m) => m.driveLink && m.driveLink.trim());
      if (isEdit) {
        await updateProperty(property.id, {
          name: data.name,
          location: data.location,
          propertyType: data.propertyType,
          description: data.description,
        });
        toast.success('Property updated');
      } else {
        await createProperty({ ...data, media: validMedia });
        toast.success('Property added');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      // toast already shown by axios interceptor
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Property' : 'Add Property'} width="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Property Name" required placeholder="e.g. Pyramid Altia Tower 3" error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input label="Location" required placeholder="e.g. Sector 70, Gurugram" error={errors.location?.message} {...register('location', { required: 'Required' })} />
        </div>
        <Select label="Property Type" options={OPTIONS.CONFIGURATION} {...register('propertyType')} />
        <Textarea label="Description (optional)" placeholder="Any notes about this property" {...register('description')} />

        {!isEdit && (
          <div>
            <p className="text-xs font-medium text-ink-muted mb-2">Photos / Videos (paste Google Drive links - make sure they're shared as "Anyone with the link")</p>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <Select className="w-28 shrink-0" options={['Photo', 'Video']} {...register(`media.${index}.mediaType`)} />
                  <Input placeholder="Drive link or file ID" className="flex-1" {...register(`media.${index}.driveLink`)} />
                  <Input placeholder="Caption (optional)" className="w-40 shrink-0 hidden sm:block" {...register(`media.${index}.caption`)} />
                  <button type="button" onClick={() => remove(index)} className="p-2.5 text-ink-faint hover:text-danger rounded-lg hover:bg-danger/10 transition-colors shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => append({ mediaType: 'Photo', driveLink: '', caption: '' })}
              className="mt-2 text-xs text-accent hover:underline flex items-center gap-1"
            >
              <Plus size={13} /> Add another
            </button>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Add Property'}</Button>
        </div>
      </form>
    </Modal>
  );
}
