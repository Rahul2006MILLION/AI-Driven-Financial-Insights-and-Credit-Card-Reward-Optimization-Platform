-- ==============================================================================
-- CLIQ Standard Spending Categories Seed
-- Supports English, Hindi, and Kannada
-- ==============================================================================

INSERT INTO public.spending_categories (id, display_name_en, display_name_hi, display_name_kn, icon_name, description)
VALUES
    ('dining', 'Dining & Food Delivery', 'डाइनिंग और भोजन', 'ಊಟ ಮತ್ತು ಆಹಾರ ವಿತರಣೆ', 'Utensils', 'Restaurants, cafes, Swiggy, Zomato, food delivery'),
    ('grocery', 'Groceries & Supermarkets', 'किराना और सुपरमार्केट', 'ದಿನಸಿ ಮತ್ತು ಸೂಪರ್‌ಮಾರ್ಕೆಟ್', 'ShoppingBag', 'Blinkit, Zepto, Instamart, DMart, Nature Basket'),
    ('shopping', 'Online & Retail Shopping', 'ऑनलाइन शॉपिंग', 'ಆನ್‌ಲೈನ್ ಶಾಪಿಂಗ್', 'ShoppingCart', 'Amazon, Flipkart, Myntra, electronics, apparel'),
    ('travel', 'Flights, Hotels & Travel', 'यात्रा और होटल', 'ವಿಮಾನ, ಹೋಟೆಲ್ ಮತ್ತು ಪ್ರಯಾಣ', 'Plane', 'MakeMyTrip, Cleartrip, airlines, IRCTC, hotels'),
    ('utility', 'Utilities & Bill Payments', 'बिल भुगतान और यूटिलिटी', 'ಬಿಲ್ ಪಾವತಿಗಳು', 'Zap', 'Electricity, water, mobile recharge, broadband, DTH'),
    ('fuel', 'Fuel & Petrol Pumps', 'ईंधन और पेट्रोल', 'ಇಂಧನ ಮತ್ತು ಪೆಟ್ರೋಲ್', 'Fuel', 'IndianOil, HPCL, BPCL, Shell petrol pumps'),
    ('entertainment', 'Movies & Entertainment', 'मनोरंजन और सिनेमा', 'ಮನರಂಜನೆ ಮತ್ತು ಸಿನೆಮಾ', 'Film', 'BookMyShow, PVR, Netflix, Spotify, events'),
    ('health', 'Healthcare & Pharmacies', 'स्वास्थ्य और फार्मेसी', 'ಆರೋಗ್ಯ ಮತ್ತು ಫಾರ್ಮಸಿ', 'HeartPulse', 'Apollo, 1mg, hospital bills, diagnostics'),
    ('other', 'General Spends', 'अन्य सामान्य खर्च', 'ಇತರ ಖರ್ಚುಗಳು', 'CreditCard', 'All other miscellaneous and offline store transactions')
ON CONFLICT (id) DO UPDATE SET
    display_name_en = EXCLUDED.display_name_en,
    display_name_hi = EXCLUDED.display_name_hi,
    display_name_kn = EXCLUDED.display_name_kn,
    icon_name = EXCLUDED.icon_name;
