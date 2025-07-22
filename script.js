// Application State - Fixed button functionality
const API_BASE_URL = 'http://localhost:5000';
let currentUser = null;
let currentBooking = null;
let selectedService = null;
let selectedProfessional = null;

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session management
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Authentication API Functions
async function loginUser(email, password) {
    try {
        const response = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Store user info locally
        const userData = {
            email: response.user.email,
            name: response.user.email.split('@')[0], // Use email prefix as name
            isLoggedIn: true
        };
        
        setCurrentUser(userData);
        return response;
    } catch (error) {
        throw error;
    }
}

async function registerUser(fullname, email, password, phone) {
    try {
        const response = await apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ fullname, email, password, phone })
        });
        
        return response;
    } catch (error) {
        throw error;
    }
}

async function registerProfessional(professionalData) {
    try {
        const response = await apiRequest('/register_professional', {
            method: 'POST',
            body: JSON.stringify(professionalData)
        });
        
        return response;
    } catch (error) {
        throw error;
    }
}

async function getProfessionals(serviceProvided, city) {
    try {
        const response = await apiRequest('/get_professionals', {
            method: 'POST',
            body: JSON.stringify({ 
                service_provided: serviceProvided, 
                city: city.toLowerCase() 
            })
        });
        
        return response.professionals || [];
    } catch (error) {
        console.error('Error fetching professionals:', error);
        return [];
    }
}

async function createBooking(bookingData) {
    try {
        const response = await apiRequest('/booking', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
        
        return response;
    } catch (error) {
        throw error;
    }
}

async function getUserBookings() {
    try {
        const response = await apiRequest('/list_bookings', {
            method: 'POST'
        });
        
        return response.bookings || [];
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}

// Service Categories Data
const services = [
    { id: 'plumbing', name: 'Plumbing', icon: 'fas fa-wrench', description: 'Pipe repairs, leaks, installations' },
    { id: 'ac-repair', name: 'AC Repair', icon: 'fas fa-snowflake', description: 'AC service, installation, maintenance' },
    { id: 'car-repair', name: 'Car Repair', icon: 'fas fa-car', description: 'Auto service, repairs, maintenance' },
    { id: 'appliance-repair', name: 'Appliance Repair', icon: 'fas fa-tools', description: 'Home appliance repairs' },
    { id: 'electrical', name: 'Electrical', icon: 'fas fa-bolt', description: 'Wiring, repairs, installations' },
    { id: 'caretaker', name: 'Caretaker', icon: 'fas fa-user-nurse', description: 'Elder care, patient care' },
    { id: 'maid', name: 'Maid Service', icon: 'fas fa-broom', description: 'House cleaning, maintenance' },
    { id: 'cook', name: 'Cook', icon: 'fas fa-utensils', description: 'Home cooking, meal preparation' },
    { id: 'gardening', name: 'Gardening', icon: 'fas fa-seedling', description: 'Garden maintenance, landscaping' },
    { id: 'home-cleaning', name: 'Home Cleaning', icon: 'fas fa-home', description: 'Deep cleaning, regular cleaning' },
    { id: 'car-cleaning', name: 'Car Cleaning', icon: 'fas fa-spray-can', description: 'Car wash, detailing' },
    { id: 'pest-control', name: 'Pest Control', icon: 'fas fa-bug', description: 'Termite, insects, rodents' },
    { id: 'laundry', name: 'Laundry', icon: 'fas fa-tshirt', description: 'Washing, ironing, dry cleaning' },
    { id: 'healthcare', name: 'Healthcare', icon: 'fas fa-heartbeat', description: 'Nurses, physiotherapy' },
    { id: 'babysitting', name: 'Babysitting', icon: 'fas fa-baby', description: 'Child care, nanny services' },
    { id: 'tailoring', name: 'Tailoring', icon: 'fas fa-cut', description: 'Stitching, alterations, repairs' }
];

// Service mapping for API
const serviceMapping = {
    'plumbing': 'plumbing',
    'ac-repair': 'ac repair',
    'car-repair': 'car repair',
    'appliance-repair': 'appliance repair',
    'electrical': 'electrical',
    'caretaker': 'caretaker',
    'maid': 'house cleaning',
    'cook': 'cooking',
    'gardening': 'gardening',
    'home-cleaning': 'house cleaning',
    'car-cleaning': 'car cleaning',
    'pest-control': 'pest control',
    'laundry': 'laundry',
    'healthcare': 'healthcare',
    'babysitting': 'babysitting',
    'tailoring': 'tailoring'
};

// Transform API professional data to match UI expectations
function transformProfessionalData(apiProfessional) {
    return {
        id: apiProfessional.professional_id,
        name: `${apiProfessional.first_name} ${apiProfessional.last_name}`,
        rating: 4.5 + Math.random() * 0.5, // Mock rating since not in API
        reviews: Math.floor(Math.random() * 200) + 50, // Mock reviews
        experience: `${apiProfessional.years_of_experience} years`,
        hourlyRate: `₹${apiProfessional.hourly_rate}/hour`,
        location: `${apiProfessional.city}`,
        verified: true,
        availability: ['2024-01-15', '2024-01-16', '2024-01-17'], // Mock availability
        specialties: Array.isArray(apiProfessional.service_provided) 
            ? apiProfessional.service_provided 
            : [apiProfessional.service_provided],
        email: apiProfessional.email,
        phone: apiProfessional.phone,
        address: apiProfessional.address,
        description: apiProfessional.service_description
    };
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Authentication Functions
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}

// Navigation Functions
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-active');
}

function redirectToLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Search Functions
function searchServices() {
    const serviceQuery = document.getElementById('serviceSearch').value;
    const locationQuery = document.getElementById('locationSearch').value;
    
    if (serviceQuery.trim()) {
        const matchedService = services.find(s => 
            s.name.toLowerCase().includes(serviceQuery.toLowerCase())
        );
        
        if (matchedService) {
            window.location.href = `service-list.html?service=${matchedService.id}&location=${encodeURIComponent(locationQuery)}`;
        } else {
            showNotification('Service not found', 'error');
        }
    }
}

// Service Functions
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" onclick="selectService('${service.id}')">
            <i class="${service.icon}"></i>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
        </div>
    `).join('');
}

function selectService(serviceId) {
    const location = document.getElementById('locationSearch')?.value || 'Kochi';
    window.location.href = `service-list.html?service=${serviceId}&location=${encodeURIComponent(location)}`;
}

// Professional Functions
async function renderProfessionals(serviceId) {
    const professionalsList = document.getElementById('professionalsList');
    if (!professionalsList) return;
    
    // Show loading state
    professionalsList.innerHTML = '<div class="loading-state">Loading professionals...</div>';
    
    try {
        const serviceProvided = serviceMapping[serviceId] || serviceId;
        const city = document.getElementById('locationDisplay')?.textContent || 'Kochi';
        
        const apiProfessionals = await getProfessionals(serviceProvided, city);
        const serviceProfessionals = apiProfessionals.map(transformProfessionalData);
        
        if (serviceProfessionals.length === 0) {
            professionalsList.innerHTML = `
                <div class="text-center p-3">
                    <p>No professionals available for this service in your area.</p>
                    <button class="btn-primary" onclick="window.location.href='become-helper.html'">
                        Become a Helper
                    </button>
                </div>
            `;
            return;
        }
        
        professionalsList.innerHTML = serviceProfessionals.map(prof => `
            <div class="professional-card">
                <div class="professional-header">
                    <div class="professional-avatar">
                        ${getInitials(prof.name)}
                    </div>
                    <div class="professional-info">
                        <h3>${prof.name}</h3>
                        <p>${prof.location}</p>
                        ${prof.verified ? '<span class="verified-badge">KYC Verified</span>' : ''}
                    </div>
                </div>
                <div class="professional-details">
                    <div class="rating">
                        <div class="stars">
                            ${'★'.repeat(Math.floor(prof.rating))}${'☆'.repeat(5 - Math.floor(prof.rating))}
                        </div>
                        <span>${prof.rating.toFixed(1)} (${prof.reviews} reviews)</span>
                    </div>
                    <p><strong>Experience:</strong> ${prof.experience}</p>
                    <p><strong>Rate:</strong> ${prof.hourlyRate}</p>
                    <p><strong>Specialties:</strong> ${prof.specialties.join(', ')}</p>
                </div>
                <div class="professional-actions">
                    <button class="btn-outline" onclick="viewProfile('${prof.id}', '${serviceId}')">
                        View Profile
                    </button>
                    <button class="btn-primary" onclick="bookNow('${prof.id}', '${serviceId}')">
                        Book Now
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        professionalsList.innerHTML = `
            <div class="error-state">
                <p>Error loading professionals: ${error.message}</p>
                <button class="btn-primary" onclick="renderProfessionals('${serviceId}')">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Update the old renderProfessionals function calls
function renderProfessionalsOld(serviceId) {
    const professionalsList = document.getElementById('professionalsList');
    if (!professionalsList) return;
    
    const serviceProfessionals = [];
    
    if (serviceProfessionals.length === 0) {
        professionalsList.innerHTML = `
            <div class="text-center p-3">
                <p>No professionals available for this service in your area.</p>
                <button class="btn-primary" onclick="window.location.href='become-helper.html'">
                    Become a Helper
                </button>
            </div>
        `;
        return;
    }
    
    professionalsList.innerHTML = serviceProfessionals.map(prof => `
        <div class="professional-card">
            <div class="professional-header">
                <div class="professional-avatar">
                    ${getInitials(prof.name)}
                </div>
                <div class="professional-info">
                    <h3>${prof.name}</h3>
                    <p>${prof.location}</p>
                    ${prof.verified ? '<span class="verified-badge">KYC Verified</span>' : ''}
                </div>
            </div>
            <div class="professional-details">
                <div class="rating">
                    <div class="stars">
                        ${'★'.repeat(Math.floor(prof.rating))}${'☆'.repeat(5 - Math.floor(prof.rating))}
                    </div>
                    <span>${prof.rating} (${prof.reviews} reviews)</span>
                </div>
                <p><strong>Experience:</strong> ${prof.experience}</p>
                <p><strong>Rate:</strong> ${prof.hourlyRate}</p>
                <p><strong>Specialties:</strong> ${prof.specialties.join(', ')}</p>
            </div>
            <div class="professional-actions">
                <button class="btn-outline" onclick="viewProfile('${prof.id}', '${serviceId}')">
                    View Profile
                </button>
                <button class="btn-primary" onclick="bookNow('${prof.id}', '${serviceId}')">
                    Book Now
                </button>
            </div>
        </div>
    `).join('');
}

function viewProfile(professionalId, serviceId) {
    window.location.href = `professional-profile.html?id=${professionalId}&service=${serviceId}`;
}

function bookNow(professionalId, serviceId) {
    if (!redirectToLogin()) return;
    window.location.href = `booking.html?professional=${professionalId}&service=${serviceId}`;
}

// Fix missing functions for buttons
function contactProfessional() {
    showNotification('Connecting call... Number will be masked for privacy');
}

function chatWithProfessional() {
    showNotification('Opening chat... Messages will be monitored for safety');
}

function bookProfessional() {
}
// Booking Functions
async function handleBookingSubmission() {
    const selectedDate = document.querySelector('.calendar-day.selected');
    const selectedTime = document.querySelector('.time-slot.selected');
    
    if (!selectedDate || !selectedTime) {
        showNotification('Please select date and time', 'error');
        return;
    }
    
    if (!document.getElementById('agreeTerms').checked) {
        showNotification('Please agree to terms and conditions', 'error');
        return;
    }
    
    // Collect form data
    const formData = new FormData(document.getElementById('bookingForm'));
    const urlParams = new URLSearchParams(window.location.search);
    const professionalId = urlParams.get('professional');
    
    const bookingData = {
        professional_id: professionalId,
        dates_and_times: [`${selectedDate.dataset.date}T${selectedTime.textContent}`],
        full_address: formData.get('address'),
        booking_date: selectedDate.dataset.date,
        booking_time: selectedTime.textContent,
        pin_code: formData.get('pincode'),
        city: formData.get('city'),
        service_type: formData.get('serviceType'),
        problem_description: formData.get('description'),
        urgency_level: formData.get('urgency'),
        user_name: formData.get('contactName'),
        user_phone: formData.get('contactPhone'),
        user_alternative_phone: formData.get('alternateContact'),
        special_instructions: formData.get('instructions')
    };
    
    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Booking...';
    submitButton.disabled = true;
    
    try {
        const response = await createBooking(bookingData);
        showNotification('Booking confirmed successfully!');
        
        setTimeout(() => {
            window.location.href = `booking-confirmation.html?id=${response.booking_id}`;
        }, 1500);
        
    } catch (error) {
        showNotification(error.message, 'error');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

function renderBookingCalendarOld() {
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) return;
    
    const today = new Date();
    const calendar = [];
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        calendar.push(date);
    }
    
    calendarContainer.innerHTML = `
        <div class="calendar-grid">
            ${calendar.map(date => `
                <div class="calendar-day" onclick="selectDate('${date.toISOString().split('T')[0]}')">
                    ${date.getDate()}
                </div>
            `).join('')}
        </div>
    `;
}

function selectDate(dateStr) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add selection to clicked date
    event.target.classList.add('selected');
    event.target.dataset.date = dateStr;
    
    // Render available time slots
    renderTimeSlots(dateStr);
}

function renderTimeSlots(date) {
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    if (!timeSlotsContainer) return;
    
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00'
    ];
    
    timeSlotsContainer.innerHTML = `
        <h4>Available Time Slots</h4>
        <div class="time-slots">
            ${timeSlots.map(time => `
                <div class="time-slot" onclick="selectTimeSlot('${time}')">
                    ${time}
                </div>
            `).join('')}
        </div>
    `;
}

function selectTimeSlot(time) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

function confirmBooking() {
    const selectedDate = document.querySelector('.calendar-day.selected');
    const selectedTime = document.querySelector('.time-slot.selected');
    
    if (!selectedDate || !selectedTime) {
        showNotification('Please select date and time', 'error');
        return;
    }
    
    const bookingData = {
        id: 'BK' + Date.now(),
        date: selectedDate.textContent,
        time: selectedTime.textContent,
        status: 'confirmed',
        professional: selectedProfessional,
        service: selectedService
    };
    
    // Save booking
    const existingBookings = JSON.parse(localStorage.getItem('userBookings')) || [];
    existingBookings.push(bookingData);
    localStorage.setItem('userBookings', JSON.stringify(existingBookings));
    
    showNotification('Booking confirmed successfully!');
    window.location.href = `booking-confirmation.html?id=${bookingData.id}`;
}

// Form Validation Functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
}

function validatePassword(password) {
    return password.length >= 8;
}

// Page-specific initialization
function initializePage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    switch (filename) {
        case 'index.html':
        case '':
            renderServices();
            break;
        case 'service-list.html':
            initializeServiceList();
            break;
        case 'professional-profile.html':
            initializeProfessionalProfile();
            break;
        case 'booking.html':
            initializeBooking();
            break;
        case 'dashboard.html':
            initializeDashboard();
            break;
        case 'login.html':
            initializeLogin();
            break;
        case 'signup.html':
            initializeSignup();
            break;
    }
}

function initializeServiceList() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service');
    const location = urlParams.get('location');
    
    if (serviceId) {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            document.getElementById('serviceTitle').textContent = service.name;
            document.getElementById('locationDisplay').textContent = location || 'Kochi';
            renderProfessionals(serviceId);
        }
    }
}

function initializeProfessionalProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const professionalId = urlParams.get('id');
    const serviceId = urlParams.get('service');
    
    // Find professional data and render profile
    for (const [service, profs] of Object.entries(professionals)) {
        const prof = profs.find(p => p.id === professionalId);
        if (prof) {
            selectedProfessional = prof;
            selectedService = serviceId;
            renderProfessionalProfile(prof);
            break;
        }
    }
}

function renderProfessionalProfile(prof) {
    const profileContainer = document.getElementById('professionalProfile');
    if (!profileContainer) return;
    
    profileContainer.innerHTML = `
        <div class="professional-profile-header">
            <div class="professional-avatar large">
                ${getInitials(prof.name)}
            </div>
            <div class="professional-info">
                <h1>${prof.name}</h1>
                <p class="location">${prof.location}</p>
                <div class="rating">
                    <div class="stars">
                        ${'★'.repeat(Math.floor(prof.rating))}${'☆'.repeat(5 - Math.floor(prof.rating))}
                    </div>
                    <span>${prof.rating} (${prof.reviews} reviews)</span>
                </div>
                ${prof.verified ? '<span class="verified-badge">KYC Verified</span>' : ''}
            </div>
        </div>
        <div class="professional-details">
            <div class="detail-section">
                <h3>Experience</h3>
                <p>${prof.experience} in the field</p>
            </div>
            <div class="detail-section">
                <h3>Rate</h3>
                <p>${prof.hourlyRate}</p>
            </div>
            <div class="detail-section">
                <h3>Specialties</h3>
                <ul>
                    ${prof.specialties.map(specialty => `<li>${specialty}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div class="action-buttons">
            <button class="btn-outline" onclick="contactProfessional()">
                <i class="fas fa-phone"></i> Call
            </button>
            <button class="btn-outline" onclick="chatWithProfessional()">
                <i class="fas fa-comment"></i> Chat
            </button>
            <button class="btn-primary" onclick="bookProfessional()">
                <i class="fas fa-calendar"></i> Book Now
            </button>
        </div>
    `;
}

function contactProfessional() {
    showNotification('Connecting call... Number will be masked for privacy');
}

function chatWithProfessional() {
    showNotification('Opening chat... Messages will be monitored for safety');
}

function bookProfessional() {
    if (!redirectToLogin()) return;
    const urlParams = new URLSearchParams(window.location.search);
    window.location.href = `booking.html?professional=${urlParams.get('id')}&service=${urlParams.get('service')}`;
}

function initializeBooking() {
    renderBookingCalendar();
}

function initializeDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('userWelcome').textContent = `Welcome back, ${user.name}!`;
    renderDashboardServices();
    renderRecentBookings();
}

function renderDashboardServices() {
    const servicesContainer = document.getElementById('dashboardServices');
    if (!servicesContainer) return;
    
    servicesContainer.innerHTML = services.slice(0, 8).map(service => `
        <div class="service-card" onclick="selectService('${service.id}')">
            <i class="${service.icon}"></i>
            <h3>${service.name}</h3>
        </div>
    `).join('');
}

function renderRecentBookings() {
    const bookingsContainer = document.getElementById('recentBookings');
    if (!bookingsContainer) return;
    
    const bookings = JSON.parse(localStorage.getItem('userBookings')) || [];
    
    if (bookings.length === 0) {
        bookingsContainer.innerHTML = '<p>No bookings yet. Book your first service!</p>';
        return;
    }
    
    bookingsContainer.innerHTML = bookings.slice(-3).map(booking => `
        <div class="booking-card">
            <h4>Booking #${booking.id}</h4>
            <p>Date: ${booking.date}</p>
            <p>Time: ${booking.time}</p>
            <p>Status: <span class="status ${booking.status}">${booking.status}</span></p>
        </div>
    `).join('');
}

function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation  
        if (!validateEmail(email) && !validatePhone(email)) {
            showNotification('Please enter a valid email or phone number', 'error');
            return;
        }
        
        if (!validatePassword(password)) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }
        
        // Show loading state
        const submitButton = document.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<div class="loading"></div> Signing in...';
        submitButton.disabled = true;
        
        // API authentication
        loginUser(email, password)
        .then(response => {
            showNotification('Login successful!');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        })
        .catch(error => {
            showNotification(error.message, 'error');
        })
        .finally(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        });
    });
}

function initializeSignup() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!name.trim()) {
            showNotification('Please enter your name', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email', 'error');
            return;
        }
        
        if (!validatePhone(phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
        
        if (!validatePassword(password)) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Show loading state
        const submitButton = document.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<div class="loading"></div> Creating account...';
        submitButton.disabled = true;
        
        // API registration
        registerUser(name, email, password, phone)
        .then(response => {
            showNotification('Registration successful! Please login now.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        })
        .catch(error => {
            showNotification(error.message, 'error');
        })
        .finally(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        });
    });
}

// Update initializeDashboard to load real bookings
async function initializeDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('userWelcome').textContent = `Welcome back, ${user.name}!`;
    renderDashboardServices();
    await renderRecentBookings();
}

async function renderRecentBookings() {
    const bookingsContainer = document.getElementById('recentBookings');
    if (!bookingsContainer) return;
    
    try {
        const bookings = await getUserBookings();
        
        if (bookings.length === 0) {
            bookingsContainer.innerHTML = '<p>No bookings yet. Book your first service!</p>';
            return;
        }
        
        bookingsContainer.innerHTML = bookings.slice(-3).map(booking => `
            <div class="booking-card">
                <h4>Booking #${booking.booking_id}</h4>
                <p>Date: ${booking.booking_date}</p>
                <p>Time: ${booking.booking_time}</p>
                <p>Status: <span class="status ${booking.booking_status}">${booking.booking_status}</span></p>
                <p>Service: ${booking.service_type}</p>
            </div>
        `).join('');
        
    } catch (error) {
        bookingsContainer.innerHTML = '<p>Error loading bookings. Please try again later.</p>';
    }
}

// Update the old initializeLogin function
function initializeLoginOld() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!validateEmail(email) && !validatePhone(email)) {
            showNotification('Please enter a valid email or phone number', 'error');
            return;
        }
        
        if (!validatePassword(password)) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }
        
        // Mock authentication
        const user = {
            email: email,
            name: email.includes('@') ? email.split('@')[0] : 'User',
            phone: ''
        };
        
        setCurrentUser(user);
        showNotification('Login successful!');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    });
}

function initializeSignupOld() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!name.trim()) {
            showNotification('Please enter your name', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email', 'error');
            return;
        }
        
        if (!validatePhone(phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
        
        if (!validatePassword(password)) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Mock registration
        const user = {
            name: name,
            email: email,
            phone: phone
        };
        
        setCurrentUser(user);
        showNotification('Registration successful!');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    });
}

// Fix navigation and mobile menu
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('mobile-active');
    }
}

// Fix logout functionality
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userBookings');
    localStorage.removeItem('savedHelpers');
    currentUser = null;
    showNotification('Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Fix search functionality
function searchServices() {
    const serviceQuery = document.getElementById('serviceSearch')?.value;
    const locationQuery = document.getElementById('locationSearch')?.value || 'Kochi';
    
    if (serviceQuery && serviceQuery.trim()) {
        const matchedService = services.find(s => 
            s.name.toLowerCase().includes(serviceQuery.toLowerCase())
        );
        
        if (matchedService) {
            window.location.href = `service-list.html?service=${matchedService.id}&location=${encodeURIComponent(locationQuery)}`;
        } else {
            showNotification('Service not found. Please try a different search term.', 'error');
        }
    } else {
        showNotification('Please enter a service to search for', 'error');
    }
}

// Fix smooth scrolling for anchor links
function scrollToServices() {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        // If on different page, go to homepage with services section
        window.location.href = 'index.html#services';
    }
}

// Handle anchor links on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a hash in the URL
    if (window.location.hash === '#services') {
        setTimeout(() => {
            const servicesSection = document.getElementById('services');
            if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
    
    initializePage();
    
    // Check authentication state
    currentUser = getCurrentUser();
    
    // Update navigation based on auth state
    updateNavigation();
    
    // Add event listeners for search
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) searchBtn.addEventListener('click', searchServices);
    
    // Add event listeners for anchor links
    document.addEventListener('click', function(e) {
        if (e.target.matches('a[href="#services"]')) {
            e.preventDefault();
            scrollToServices();
        }
    });
});

// Initialize the application
// (Moved above to avoid duplication)

function updateNavigation() {
    const authButtons = document.querySelector('.nav-links');
    if (!authButtons) return;
    
    if (currentUser) {
        authButtons.innerHTML = `
            <a href="dashboard.html" class="nav-link" onclick="navigateTo('dashboard.html')">Dashboard</a>
            <a href="bookings.html" class="nav-link" onclick="navigateTo('bookings.html')">My Bookings</a>
            <a href="profile.html" class="nav-link" onclick="navigateTo('profile.html')">Profile</a>
            <button class="btn-secondary" onclick="logout()">Logout</button>
        `;
    }
}

// Event Listeners
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'serviceSearch' || activeElement.id === 'locationSearch') {
            searchServices();
        }
    }
});

// Fix navigation function
function navigateTo(url) {
    window.location.href = url;
}

// Fix form submissions and button clicks
function handleFormSubmission(formId, callback) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            callback(e);
        });
    }
}

// Fix notification system
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
    
    // Add click to dismiss
    notification.addEventListener('click', () => {
        notification.remove();
    });
}

// Fix button hover effects and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for all buttons
    document.addEventListener('click', function(e) {
        // Handle button clicks with proper feedback
        if (e.target.matches('button') || e.target.closest('button')) {
            const button = e.target.matches('button') ? e.target : e.target.closest('button');
            
            // Add visual feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    });
});

// Prevent right-click context menu on production
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});