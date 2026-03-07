import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";
import "./styles/b_profile.css";

function BusinessProfile() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("loading"); // loading, view, edit, create
  const [formData, setFormData] = useState({
    legalName: "",
    entityType: "",
    entityTypeCustom: "",
    incorporationDate: "",
    headquartersCountry: "",
    stateOrRegion: "",
    employeeCountRange: "",
    remoteWorkforce: false,
    usesContractors: false,
    countriesOfOperation: [],
    customerRegions: [],
    storesPersonalData: false,
    storesFinancialData: false,
    storesHealthData: false,
    cloudHosted: false,
    cloudProviders: [],
    industry: "",
    industryCustom: "",
    businessModel: "",
    sellsToEnterprises: false,
    revenueRange: "",
    taxRegistered: false
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/business-profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.profile && data.profile.legalName) {
          setFormData(data.profile);
          setMode("view");
        } else {
          setMode("create");
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        setMode("create");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    let finalValue = value;
    
    if (value === "true") finalValue = true;
    if (value === "false") finalValue = false;
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleMultiSelect = (fieldName, value) => {
    setFormData(prev => {
      const current = prev[fieldName] || [];
      if (current.includes(value)) {
        return { ...prev, [fieldName]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [fieldName]: [...current, value] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Form Data:", formData);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/business-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMode("view");
        setLoading(false);
      } else {
        setError("Failed to save profile");
        setLoading(false);
      }
    } catch (error) {
      setError("Cannot connect to server");
      setLoading(false);
    }
  };

  if (mode === "loading") {
    return (
      <div className="profile-container">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  if (mode === "view") {
    return (
      <div className="profile-container">
        <div className="profile-view-compact">
          {/* Identity Header */}
          <div className="profile-identity">
            <div className="identity-left">
              <h1>{formData.legalName}</h1>
              <div className="identity-meta">
                <span className="entity-badge">{formData.entityType}</span>
                <span className="location-text">
                  📍 {formData.stateOrRegion}, {formData.headquartersCountry}
                </span>
                {formData.incorporationDate && (
                  <span className="location-text">
                    📅 Since {new Date(formData.incorporationDate).getFullYear()}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setMode("edit")} className="btn-edit">
              Edit Profile
            </button>
          </div>

          {/* Workforce & Operations */}
          <div className="view-section-compact">
            <h2 className="section-title">Workforce & Operations</h2>
            <div className="view-grid-compact">
              <div className="view-item">
                <span className="view-label">Team Size</span>
                <span className="view-value">{formData.employeeCountRange} employees</span>
              </div>
              <div className="view-item">
                <span className="view-label">Work Model</span>
                <span className="view-value">{formData.remoteWorkforce ? "Remote" : "Office-based"}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Contractors</span>
                <span className="view-value">{formData.usesContractors ? "Yes" : "No"}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Operating In</span>
                <div className="value-list">
                  {formData.countriesOfOperation?.map(country => (
                    <span key={country} className="value-tag">{country}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="view-section-compact">
            <h2 className="section-title">Business Details</h2>
            <div className="view-grid-compact">
              <div className="view-item">
                <span className="view-label">Industry</span>
                <span className="view-value">{formData.industry}{formData.industryCustom && ` (${formData.industryCustom})`}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Business Model</span>
                <span className="view-value">{formData.businessModel}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Revenue Range</span>
                <span className="view-value">{formData.revenueRange}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Enterprise Sales</span>
                <span className="view-value">{formData.sellsToEnterprises ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          {/* Data & Compliance */}
          <div className="view-section-compact">
            <h2 className="section-title">Data & Compliance</h2>
            <div className="view-grid-compact">
              <div className="view-item">
                <span className="view-label">Data Types Stored</span>
                <div className="value-list">
                  {formData.storesPersonalData && <span className="value-tag">Personal</span>}
                  {formData.storesFinancialData && <span className="value-tag">Financial</span>}
                  {formData.storesHealthData && <span className="value-tag">Health</span>}
                  {!formData.storesPersonalData && !formData.storesFinancialData && !formData.storesHealthData && (
                    <span className="view-value">None</span>
                  )}
                </div>
              </div>
              <div className="view-item">
                <span className="view-label">Cloud Infrastructure</span>
                {formData.cloudHosted ? (
                  <div className="value-list">
                    {formData.cloudProviders?.map(provider => (
                      <span key={provider} className="value-tag">{provider}</span>
                    ))}
                  </div>
                ) : (
                  <span className="view-value">On-premise</span>
                )}
              </div>
              <div className="view-item">
                <span className="view-label">Tax Status</span>
                <span className="view-value">{formData.taxRegistered ? "Registered" : "Not Registered"}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Customer Regions</span>
                <div className="value-list">
                  {formData.customerRegions?.map(region => (
                    <span key={region} className="value-tag">{region}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Business Profile</h1>
        <p>{mode === "create" ? "Help us understand your organization to provide relevant compliance guidance" : "Update your business information"}</p>
        {mode === "edit" && (
          <button onClick={() => setMode("view")} className="btn-cancel">
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {error && <div className="error-alert">{error}</div>}

        {/* Section 1: Organization Identity */}
        <div className="form-section">
          <h2 className="section-title">Organization Identity</h2>
          
          <div className="form-group">
            <label>Legal Name *</label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Entity Type *</label>
            <select
              name="entityType"
              value={formData.entityType || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select entity type</option>
              <option value="Private Limited">Private Limited</option>
              <option value="LLP">LLP</option>
              <option value="Partnership">Partnership</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.entityType === "Other" && (
            <div className="form-group">
              <label>Specify Entity Type</label>
              <input
                type="text"
                name="entityTypeCustom"
                value={formData.entityTypeCustom || ""}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Incorporation Date *</label>
              <input
                type="date"
                name="incorporationDate"
                value={formData.incorporationDate ? formData.incorporationDate.split('T')[0] : ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Headquarters Country *</label>
              <select
                name="headquartersCountry"
                value={formData.headquartersCountry || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select country</option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Singapore">Singapore</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>State / Region *</label>
            <input
              type="text"
              name="stateOrRegion"
              value={formData.stateOrRegion || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Section 2: Workforce Information */}
        <div className="form-section">
          <h2 className="section-title">Workforce Information</h2>

          <div className="form-group">
            <label>Employee Count Range *</label>
            <select
              name="employeeCountRange"
              value={formData.employeeCountRange || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select range</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Remote Workforce *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="remoteWorkforce"
                    value="true"
                    checked={formData.remoteWorkforce === true}
                    onChange={handleChange}
                    required
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="remoteWorkforce"
                    value="false"
                    checked={formData.remoteWorkforce === false}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Uses Contractors *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="usesContractors"
                    value="true"
                    checked={formData.usesContractors === true}
                    onChange={handleChange}
                    required
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="usesContractors"
                    value="false"
                    checked={formData.usesContractors === false}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Operational Geography */}
        <div className="form-section">
          <h2 className="section-title">Operational Geography</h2>

          <div className="form-group">
            <label>Countries of Operation *</label>
            <div className="checkbox-grid">
              {["India", "United States", "United Kingdom", "Singapore", "UAE", "Other"].map(country => (
                <label key={country} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(formData.countriesOfOperation || []).includes(country)}
                    onChange={() => handleMultiSelect("countriesOfOperation", country)}
                  />
                  {country}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Customer Regions *</label>
            <div className="checkbox-grid">
              {["Asia", "Europe", "North America", "South America", "Africa", "Australia"].map(region => (
                <label key={region} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(formData.customerRegions || []).includes(region)}
                    onChange={() => handleMultiSelect("customerRegions", region)}
                  />
                  {region}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Data & Risk Exposure */}
        <div className="form-section">
          <h2 className="section-title">Data & Risk Exposure</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Stores Personal Data *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="storesPersonalData"
                    value="true"
                    checked={formData.storesPersonalData === true}
                    onChange={handleChange}
                    required
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="storesPersonalData"
                    value="false"
                    checked={formData.storesPersonalData === false}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Stores Financial Data *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="storesFinancialData"
                    value="true"
                    checked={formData.storesFinancialData === true}
                    onChange={handleChange}
                    required
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="storesFinancialData"
                    value="false"
                    checked={formData.storesFinancialData === false}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stores Health Data *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="storesHealthData"
                    value="true"
                    checked={formData.storesHealthData === true}
                    onChange={handleChange}
                    required
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="storesHealthData"
                    value="false"
                    checked={formData.storesHealthData === false}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Cloud Hosted *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="cloudHosted"
                    value="true"
                    checked={formData.cloudHosted === true}
                    onChange={handleChange}
                    required
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="cloudHosted"
                    value="false"
                    checked={formData.cloudHosted === false}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          {formData.cloudHosted === true && (
            <div className="form-group">
              <label>Cloud Providers</label>
              <div className="checkbox-grid">
                {["AWS", "Azure", "GCP", "Other"].map(provider => (
                  <label key={provider} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.cloudProviders || []).includes(provider)}
                      onChange={() => handleMultiSelect("cloudProviders", provider)}
                    />
                    {provider}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Business Nature */}
        <div className="form-section">
          <h2 className="section-title">Business Nature</h2>

          <div className="form-group">
            <label>Industry *</label>
            <select
              name="industry"
              value={formData.industry || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select industry</option>
              <option value="SaaS">SaaS</option>
              <option value="Fintech">Fintech</option>
              <option value="Healthcare">Healthcare</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Consulting">Consulting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.industry === "Other" && (
            <div className="form-group">
              <label>Specify Industry</label>
              <input
                type="text"
                name="industryCustom"
                value={formData.industryCustom || ""}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Business Model *</label>
              <select
                name="businessModel"
                value={formData.businessModel || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select model</option>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sells to Enterprises *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="sellsToEnterprises"
                    value="true"
                    checked={formData.sellsToEnterprises === true}
                    onChange={handleChange}
                    required
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="sellsToEnterprises"
                    value="false"
                    checked={formData.sellsToEnterprises === false}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Financial Size */}
        <div className="form-section">
          <h2 className="section-title">Financial Size</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Revenue Range *</label>
              <select
                name="revenueRange"
                value={formData.revenueRange || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select range</option>
                <option value="Pre-revenue">Pre-revenue</option>
                <option value="< 1 Cr">&lt; 1 Cr</option>
                <option value="1–10 Cr">1–10 Cr</option>
                <option value="10–100 Cr">10–100 Cr</option>
                <option value="100 Cr+">100 Cr+</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tax Registered *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="taxRegistered"
                    value="true"
                    checked={formData.taxRegistered === true}
                    onChange={handleChange}
                    required
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="taxRegistered"
                    value="false"
                    checked={formData.taxRegistered === false}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BusinessProfile;
