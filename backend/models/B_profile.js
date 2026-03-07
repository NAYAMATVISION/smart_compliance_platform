const mongoose = require("mongoose");

const businessProfileSchema = new mongoose.Schema(
{
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },

  legalName: String,
  entityType: String,
  entityTypeCustom: String,
  incorporationDate: Date,
  headquartersCountry: String,
  stateOrRegion: String,

  employeeCountRange: String,
  remoteWorkforce: Boolean,
  usesContractors: Boolean,

  countriesOfOperation: [String],
  customerRegions: [String],

  storesPersonalData: Boolean,
  storesFinancialData: Boolean,
  storesHealthData: Boolean,
  cloudHosted: Boolean,
  cloudProviders: [String],

  industry: String,
  industryCustom: String,
  businessModel: String,
  sellsToEnterprises: Boolean,

  revenueRange: String,
  taxRegistered: Boolean
},
{ timestamps: true }
);

module.exports = mongoose.model("BusinessProfile", businessProfileSchema, "b_profiles");
