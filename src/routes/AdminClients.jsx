import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';

function AdminClients() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('wingman');
  const [companyName, setCompanyName] = useState('');
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/create-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, tier, company_name: companyName, client_id: clientId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create client');
      }

      const data = await response.json();
      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#05060a]">
      <div className="relative">
        <div className="absolute inset-0 opacity-40">
          <img
            src="/images/sunset-road.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-8 relative z-10">
          <form onSubmit={onSubmit}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Client Email"
              required
            />
            <Input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Client ID"
              required
            />
            <Input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name"
              required
            />
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-rajdhani text-white pl-3 mt-2"
            >
              <option value="wingman">Wingman</option>
              <option value="guardian">Guardian</option>
              <option value="apex_command">Apex Command</option>
            </select>
            {loading ? (
              <Button disabled>Loading...</Button>
            ) : (
              <Button type="submit">Create Client</Button>
            )}
          </form>
          {successMessage && (
            <div className="mt-4 font-rajdhani text-sm text-green-300">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="mt-4 font-rajdhani text-sm text-red-300">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminClients;
