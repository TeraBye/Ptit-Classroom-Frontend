"use client";

import React, { useState } from 'react';
import { toastError } from '@/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditClassModalProps {
    open: boolean;
    onClose: () => void;
    classroom: any;
    onSave: (updated: any) => Promise<void> | void;
}

export default function EditClassModal({ open, onClose, classroom, onSave }: EditClassModalProps) {
    const [form, setForm] = useState({
        name: classroom?.name || '',
        meetLink: classroom?.meetLink || '',
        isPublic: classroom?.public ?? true,
    });
    const [saving, setSaving] = useState(false);
    const modalRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        setForm({
            name: classroom?.name || '',
            meetLink: classroom?.meetLink || '',
            isPublic: classroom?.public ?? true,
        });
    }, [classroom]);

    React.useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        if (open) document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [open, onClose]);

    if (!open) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({ ...classroom, ...form });
            onClose();
        } catch (err) {
            console.error(err);
            toastError('Save failed');
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md relative">
                <button className="absolute top-2 right-2" onClick={onClose}><X /></button>
                <h3 className="text-lg font-semibold mb-3">Edit classroom</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                        <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Meet link</label>
                        <input name="meetLink" value={form.meetLink} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input id="isPublic" type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} />
                        <label htmlFor="isPublic" className="text-sm">Public</label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
