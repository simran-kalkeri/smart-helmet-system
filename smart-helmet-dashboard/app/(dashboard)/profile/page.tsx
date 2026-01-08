"use client";

import { useState } from "react";
import { User, Phone, Save, Mail, Shield, Plus, Trash2 } from "lucide-react";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "Simran Kalkeri",
        email: "simran.k@example.com",
        phone: "+91 98765 43210",
        helmetId: "SH-2024-001",
        photo: null
    });

    const [emergencyContacts, setEmergencyContacts] = useState([
        { id: 1, name: "Father", phone: "+91 98989 89898" },
        { id: 2, name: "Brother", phone: "+91 87878 78787" }
    ]);

    const [newContact, setNewContact] = useState({ name: "", phone: "" });

    const handleSave = () => {
        setIsEditing(false);
        // Here we would sync with backend
        alert("Profile Updated Successfully!");
    };

    const addContact = () => {
        if (newContact.name && newContact.phone) {
            setEmergencyContacts([...emergencyContacts, { id: Date.now(), ...newContact }]);
            setNewContact({ name: "", phone: "" });
        }
    };

    const removeContact = (id: number) => {
        setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
    };

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1>My Profile</h1>
                <button
                    className={`btn ${isEditing ? "btn-success" : "btn-primary"}`}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                    {isEditing ? <><Save size={18} style={{ marginRight: 8 }} /> Save Changes</> : "Edit Profile"}
                </button>
            </div>

            <div className="profile-grid">
                {/* Main Info Card */}
                <div className="glass-panel profile-card">
                    <div className="profile-header">
                        <div className="avatar-large">
                            {profile.name.charAt(0)}
                        </div>
                        <div className="profile-title">
                            <h2>{profile.name}</h2>
                            <span className="badge">Premium User</span>
                        </div>
                    </div>

                    <div className="info-list">
                        <div className="info-group">
                            <label><User size={16} /> Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            ) : (
                                <p>{profile.name}</p>
                            )}
                        </div>

                        <div className="info-group">
                            <label><Mail size={16} /> Email</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                />
                            ) : (
                                <p>{profile.email}</p>
                            )}
                        </div>

                        <div className="info-group">
                            <label><Phone size={16} /> Phone</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            ) : (
                                <p>{profile.phone}</p>
                            )}
                        </div>

                        <div className="info-group">
                            <label><Shield size={16} /> Helmet Device ID</label>
                            <p className="device-id">{profile.helmetId}</p>
                        </div>
                    </div>
                </div>

                {/* Emergency Contacts Card */}
                <div className="glass-panel contacts-card">
                    <h3>Emergency Contacts</h3>
                    <p className="subtitle">People to notify in case of an accident.</p>

                    <div className="contacts-list">
                        {emergencyContacts.map(contact => (
                            <div key={contact.id} className="contact-item">
                                <div className="contact-info">
                                    <span className="c-name">{contact.name}</span>
                                    <span className="c-phone">{contact.phone}</span>
                                </div>
                                {isEditing && (
                                    <button className="icon-btn danger" onClick={() => removeContact(contact.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <div className="add-contact-form">
                            <input
                                type="text"
                                placeholder="Name (e.g. Mom)"
                                value={newContact.name}
                                onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={newContact.phone}
                                onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                            />
                            <button className="btn-icon-only" onClick={addContact}>
                                <Plus size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .profile-page {
          padding-bottom: 40px;
        }

        .page-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-bottom: 32px;
        }

        .profile-grid {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 24px;
        }
        
        @media (max-width: 900px) {
           .profile-grid { grid-template-columns: 1fr; }
        }

        .profile-card, .contacts-card {
           padding: 32px;
        }

        .profile-header {
           display: flex;
           align-items: center;
           gap: 20px;
           margin-bottom: 32px;
        }

        .avatar-large {
           width: 80px;
           height: 80px;
           background: linear-gradient(135deg, var(--primary), #8b5cf6);
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 2.5rem;
           font-weight: 700;
           color: white;
           box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        }

        .profile-title h2 {
           margin-bottom: 4px;
        }

        .badge {
           background: rgba(245, 158, 11, 0.2);
           color: var(--accent);
           padding: 4px 10px;
           border-radius: 20px;
           font-size: 0.75rem;
           font-weight: 600;
           text-transform: uppercase;
        }

        .info-list {
           display: flex;
           flex-direction: column;
           gap: 20px;
        }

        .info-group label {
           display: flex;
           align-items: center;
           gap: 8px;
           font-size: 0.9rem;
           color: var(--secondary-text, #94a3b8);
           margin-bottom: 6px;
        }

        .info-group p {
           font-size: 1.1rem;
           font-weight: 500;
           padding-left: 24px;
        }
        
        .info-group input {
           width: 100%;
           background: rgba(0,0,0,0.2);
           border: 1px solid var(--card-border);
           padding: 10px;
           border-radius: 8px;
           color: var(--foreground);
           margin-top: 4px;
        }

        .device-id {
           font-family: monospace;
           background: rgba(255,255,255,0.05);
           padding: 4px 8px;
           border-radius: 4px;
           display: inline-block;
        }

        .subtitle {
           color: var(--secondary-text, #94a3b8);
           margin-bottom: 24px;
        }

        .contacts-list {
           display: flex;
           flex-direction: column;
           gap: 12px;
           margin-bottom: 24px;
        }

        .contact-item {
           display: flex;
           justify-content: space-between;
           align-items: center;
           padding: 12px 16px;
           background: rgba(255,255,255,0.03);
           border-radius: 8px;
           border: 1px solid var(--card-border);
        }

        .contact-info {
           display: flex;
           flex-direction: column;
        }

        .c-name { font-weight: 500; }
        .c-phone { font-size: 0.9rem; color: var(--secondary-text, #94a3b8); }

        .add-contact-form {
           display: flex;
           gap: 10px;
           margin-top: 20px;
           padding-top: 20px;
           border-top: 1px solid var(--card-border);
        }
        
        .add-contact-form input {
           flex: 1;
           background: rgba(0,0,0,0.2);
           border: 1px solid var(--card-border);
           padding: 10px;
           border-radius: 8px;
           color: var(--foreground);
        }
        
        .btn-icon-only {
           background: var(--primary);
           color: white;
           border: none;
           width: 44px;
           border-radius: 8px;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
        }

        .icon-btn.danger {
           background: rgba(239, 68, 68, 0.1);
           color: var(--danger);
           border: none;
           padding: 8px;
           border-radius: 6px;
           cursor: pointer;
        }
        
        .btn-success {
           background: var(--success);
           color: white;
        }
      `}</style>
        </div>
    );
}
