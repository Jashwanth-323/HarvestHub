
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Embed English translations as a reliable fallback
const enTranslations = {
  header: {
    home: "Home",
    about: "About",
    contact: "Contact",
    findFarms: "Find Farms",
    login: "Login",
    dashboard: "Dashboard",
    logout: "Logout",
    admin: "Admin"
  },
  home: {
    hero: {
      title: "Fresh Produce <br/> From Local Farmers",
      subtitle: "Your one-stop shop for fresh, locally sourced produce, delivered to your door.",
      shopNow: "Shop Now"
    },
    categories: {
      title: "Shop by Category",
    },
    featured: {
      title: "Featured Products",
    },
    grains: {
      title: "Our Grains Selection",
    },
  },
  auth: {
    welcome: "Welcome to HarvestHub",
    createAccount: "Create your Account",
    createBuyerAccount: "Create a Buyer Account",
    createFarmerAccount: "Create a Farmer Account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signup: "Sign up",
    signin: "Sign in",
    continueGuest: "Continue as Guest",
    forgotPasswordLink: "Forgot your password?",
    forgotPasswordTitle: "Reset Your Password",
    forgotPasswordSubtitle: "Enter your email address and we'll send you a link to reset your password.",
    sendResetLink: "Send Reset Link",
    backToLogin: "Back to Login",
    back: "Back",
    joinAs: "Join HarvestHub",
    selectRole: "First, let us know who you are.",
    deliveryAddress: "Delivery Address",
    street: "Street Address",
    city: "City",
    zip: "ZIP / Postal Code",
    role: {
        buyer: "I'm a Buyer",
        farmer: "I'm a Farmer",
        buyerDesc: "Browse and buy fresh produce directly from local farms.",
        farmerDesc: "Sell your produce, manage your inventory, and grow your business."
    },
    farmLocation: "Farm Location (Village/Taluk/District)",
    farmerType: "Type of Farmer",
    signupSuccess: "Welcome, {{fullName}}! Your account has been created.",
    smsConfirmationSuccess: "A confirmation SMS has been sent to your registered mobile number.",
    smsConfirmationError: "Failed to send SMS confirmation. Please check your mobile number or contact support.",
    adminRegistrationRestricted: "Admin accounts cannot be self-registered and are created internally for security reasons." // New key
  },
  dashboard: {
    welcome: "Welcome",
    overview: "Overview",
    analytics: "Analytics",
    products: "My Products",
    orders: "Orders",
    earnings: "Earnings",
    profile: "Profile",
    users: "User Management",
    aiInsights: "AI Insights",
    myOrders: "My Orders",
    profileSettings: "Profile Settings",
    exploreProducts: "Explore Products",
    priceSuggestionFor: "AI Price Suggestion for {{productName}}",
    noSpecificSuggestion: "No specific price suggestion found for this product.",
    noSuggestionsReturned: "AI did not return any price suggestions.",
    failedToGetAiSuggestion: "Failed to get AI price suggestions.",
    currentPrice: "Current Price",
    suggestedPrice: "Suggested Price",
    reason: "Reason",
    productDetails: "Product Details",
    productDescription: "Description",
    productCategory: "Category",
    productUnit: "Unit",
    productStock: "Stock",
    productStatus: "Status",
    enabled: "Enabled",
    disabled: "Disabled",
    aiPriceSuggestion: "AI Price Suggestion",
    manageUsers: "Manage Customers",
    farmerCustomerManagementInfo: "View and manage customers who have placed orders with your farm. You can view their details and block/activate their accounts.",
    searchCustomers: "Search Customers",
    searchCustomersPlaceholder: "Search by name, email, or phone",
    customerName: "Customer Name",
    customerEmail: "Customer Email",
    customerPhone: "Customer Phone",
    customerAddress: "Delivery Address",
    customerAccountStatus: "Account Status",
    viewDetails: "View Details",
    blockUser: "Block User",
    activateUser: "Activate User",
    statusUpdateFailed: "Status update failed",
    cannotModifyOtherFarmersOwners: "Cannot modify other farmers or owners.",
    cannotBlockSelf: "You cannot block your own account.",
    statusUpdatedSuccess: "User status updated successfully.",
    noCustomersFound: "No customers found.",
  },
  products: {
    allOurProducts: "All Our Products",
    explore: "Explore everything we have to offer, fresh from the farm.",
    ourSelection: "Our Fresh Selection",
    browse: "Browse our collection of farm-fresh products.",
    category: "Category",
    farmer: "Farmer", // New key
    allFarmers: "All Farmers" // New key
  },
  farmDetail: {
    notFoundTitle: "Farm Not Found",
    notFoundSubtitle: "The farm you are looking for does not exist or is not registered with HarvestHub.",
    contactInfo: "Contact Information",
    productsOffered: "Products Offered by This Farm",
    noProducts: "This farm currently has no products listed on HarvestHub.",
    aboutFarm: "About This Farm",
    descriptionPlaceholder: "Welcome to {{farmName}}! We are dedicated to providing the freshest, highest quality produce directly from our fields to your table. We believe in sustainable farming practices and connecting our community with wholesome food. Explore our selection and taste the difference that local, fresh ingredients make.",
    farm: "Farm"
  },
  about: {
    title: "About Us",
    subtitle: "Connecting you with the freshest produce from local farmers.",
  },
  contact: {
    title: "Contact Us",
    subtitle: "We'd love to hear from you! Reach out with any questions or feedback."
  },
  findFarms: {
    title: "Find Local Farms",
    subtitle: "See farms near your location on the map and get details powered by Gemini and Google Maps.",
    button: "Find Farms Near Me",
    gettingLocation: "Getting your location...",
    findingFarms: "Asking HarvestBot to find nearby farms...",
    locationError: "Could not get your location. Please enable location services in your browser settings.",
    apiError: "Sorry, couldn't find farms at the moment. Please try again later.",
    sources: "Information Sources (from Google Maps):",
  },
  common: {
    backToHome: "Back to Home",
    close: "Close",
    enterProductNameForImage: "Please enter a product name to generate an image.",
    imageGeneratedSuccess: "Image generated successfully!",
    failedToGenerateImage: "Failed to generate image with AI.",
    generatingImage: "Generating...",
    aiGenerateImage: "AI Generate Image",
    previous: "Previous",
    next: "Next",
    generating: "Generating..."
  },
  admin: {
    readOnlyView: "Read-Only Dashboard",
    accessDenied: "Access Denied",
    accessDeniedInfo: "You do not have the necessary permissions to access the full admin dashboard.",
    goToHomepage: "Go to Homepage",
    ownerDashboardTitle: "Admin Dashboard",
    marketplaceOwner: "Marketplace Owner",
    users: "Users",
    orders: "Orders",
    payments: "Payments",
    disputes: "Disputes",
    priceMonitoring: "Price Monitoring",
    analytics: "Analytics",
    auditLog: "Audit Log",
    userManagement: "User Management",
    exportCsv: "Export CSV",
    searchUsers: "Search Users",
    searchUsersPlaceholder: "Search by name, email, or mobile",
    name: "Name",
    email: "Email",
    role: "Role",
    status: "Status",
    actions: "Actions",
    owner: "Owner",
    active: "Active",
    blocked: "Blocked",
    block: "Block",
    activate: "Activate",
    noUsersFound: "No users found.",
    productManagement: "Product Management",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    addNewProduct: "Add New Product",
    confirmDeleteProduct: "Are you sure you want to delete this product?",
    product: "Product",
    category: "Category",
    price: "Price",
    stock: "Stock",
    saveProduct: "Save Product",
    cancel: "Cancel",
    productName: "Product Name",
    description: "Description",
    imageUrl: "Image URL",
    unit: "Unit",
    productEnabled: "Product Enabled",
    systemAuditLog: "System Audit Log",
    timestamp: "Timestamp",
    user: "User",
    action: "Action",
    details: "Details",
    orderManagement: "Order Management",
    orderId: "Order ID",
    customer: "Customer",
    farmer: "Farmer",
    date: "Date",
    total: "Total",
    noOrdersFound: "No orders found.",
    paymentOverview: "Payment Overview",
    revenueByPaymentMethod: "Revenue by Payment Method",
    totalRevenue: "Total Revenue",
    recentPayments: "Recent Payments",
    paymentMethod: "Payment Method",
    totalAmount: "Total Amount",
    noPaymentsRecorded: "No payments recorded yet.",
    disputeManagement: "Dispute Management",
    disputesComingSoon: "Dispute Management coming soon!",
    disputesFutureScope: "This section will allow administrators to review and resolve disputes between buyers and farmers.",
    getAiPriceSuggestions: "Get AI Price Suggestions",
    suggestionsGeneratedSuccess: "AI price suggestions generated successfully!",
    noPriceSuggestions: "No price suggestions generated yet.",
    clickButtonToGenerate: "Click the button above to generate AI price suggestions for all products.",
    analyticsPanel: "Analytics Panel",
    totalSalesRevenue: "Total Sales Revenue",
    totalOrders: "Total Orders",
    totalProducts: "Total Products",
    salesByCategory: "Sales by Category",
    farmerPerformance: "Farmer Performance (Top Sellers)",
    noFarmerPerformanceData: "No farmer performance data available yet.",
    demandHeatmap: "Demand Heatmap",
    demandHeatmapComingSoon: "Demand Heatmap coming soon!",
    demandHeatmapFutureScope: "This will visualize product demand across different locations and times."
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  // Updated t function signature to accept optional replacements
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('language') || 'en');
  const [translations, setTranslations] = useState<any>(enTranslations);

  useEffect(() => {
    const loadTranslations = async () => {
      if (language === 'en') {
        setTranslations(enTranslations);
        return;
      }
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(`Could not load translations for ${language}, falling back to English.`, error);
        setTranslations(enTranslations);
      }
    };

    loadTranslations();
  }, [language]);


  const setLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  // Updated t function implementation to handle replacements
  const t = (key: string, replacements?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      result = result?.[k];
    }
    
    let translatedString: string = typeof result === 'string' ? result : '';

    // Fallback to English if translation key not found or is not a string
    if (!translatedString) {
      let fallback: any = enTranslations;
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      translatedString = typeof fallback === 'string' ? fallback : key; // Fallback to key if even English is not found
    }

    // Apply replacements if provided
    if (replacements && translatedString) {
      for (const [placeholder, value] of Object.entries(replacements)) {
        translatedString = translatedString.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
      }
    }
    
    return translatedString;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};