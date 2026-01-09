// Wedding Date - Change this to your wedding date
const weddingDate = new Date('2026-02-15T10:00:00').getTime();

// Countdown Timer
function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = '<p style="font-size: 1.5rem; color: var(--secondary-color);">Chúng tôi đã kết hôn! 💍</p>';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown();

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// GOOGLE SHEETS INTEGRATION
// ============================================
// 
// Để kết nối với Google Sheets, bạn cần:
// 1. Tạo một Google Sheet mới
// 2. Vào Extensions > Apps Script
// 3. Dán code sau vào Apps Script:
//
// function doPost(e) {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//   var data = JSON.parse(e.postData.contents);
//   
//   sheet.appendRow([
//     new Date(),
//     data.name,
//     data.email,
//     data.attending,
//     data.message
//   ]);
//   
//   return ContentService
//     .createTextOutput(JSON.stringify({status: 'success'}))
//     .setMimeType(ContentService.MimeType.JSON);
// }
//
// function doGet(e) {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//   var data = sheet.getDataRange().getValues();
//   var wishes = [];
//   
//   for (var i = 1; i < data.length; i++) {
//     wishes.push({
//       timestamp: data[i][0],
//       name: data[i][1],
//       email: data[i][2],
//       attending: data[i][3],
//       message: data[i][4]
//     });
//   }
//   
//   return ContentService
//     .createTextOutput(JSON.stringify(wishes))
//     .setMimeType(ContentService.MimeType.JSON);
// }
//
// 4. Deploy > New deployment > Web app
// 5. Execute as: Me, Who has access: Anyone
// 6. Copy the Web app URL và dán vào biến GOOGLE_SCRIPT_URL bên dưới
// ============================================

// THAY ĐỔI URL NÀY BẰNG URL CỦA BẠN
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// Guestbook Form Submission
const guestbookForm = document.getElementById('guestbook-form');
const formMessage = document.getElementById('form-message');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');

guestbookForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        attending: document.getElementById('attending').value,
        message: document.getElementById('message').value.trim()
    };

    // Validate
    if (!formData.name || !formData.message) {
        showMessage('Vui lòng điền đầy đủ họ tên và lời chúc!', 'error');
        return;
    }

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    guestbookForm.querySelector('button').disabled = true;

    try {
        // Check if Google Script URL is configured
        if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            // Demo mode - just show success and add to local display
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            
            // Add wish to display
            addWishToDisplay({
                name: formData.name,
                message: formData.message,
                timestamp: new Date().toISOString()
            });
            
            showMessage('Cảm ơn bạn đã gửi lời chúc! (Demo mode - chưa kết nối Google Sheets)', 'success');
            guestbookForm.reset();
        } else {
            // Send to Google Sheets
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Add wish to display
            addWishToDisplay({
                name: formData.name,
                message: formData.message,
                timestamp: new Date().toISOString()
            });

            showMessage('Cảm ơn bạn đã gửi lời chúc! Lời chúc của bạn đã được ghi nhận.', 'success');
            guestbookForm.reset();
            
            // Reload wishes after a short delay
            setTimeout(loadWishes, 2000);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Có lỗi xảy ra. Vui lòng thử lại sau!', 'error');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        guestbookForm.querySelector('button').disabled = false;
    }
});

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = 'form-message ' + type;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        formMessage.className = 'form-message';
    }, 5000);
}

function addWishToDisplay(wish) {
    const wishesContainer = document.getElementById('wishes-container');
    const wishCard = document.createElement('div');
    wishCard.className = 'wish-card';
    
    const date = new Date(wish.timestamp);
    const formattedDate = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    wishCard.innerHTML = `
        <p class="wish-name">${escapeHtml(wish.name)}</p>
        <p class="wish-date">${formattedDate}</p>
        <p class="wish-message">${escapeHtml(wish.message)}</p>
    `;
    
    // Add to the beginning of the list
    wishesContainer.insertBefore(wishCard, wishesContainer.firstChild);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load existing wishes from Google Sheets
async function loadWishes() {
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        // Demo mode - show sample wishes
        const sampleWishes = [
            {
                name: 'Nguyễn Văn A',
                message: 'Chúc hai bạn trăm năm hạnh phúc, sớm có thiên thần nhỏ!',
                timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
                name: 'Trần Thị B',
                message: 'Chúc mừng hạnh phúc! Mong hai bạn luôn yêu thương và đồng hành cùng nhau.',
                timestamp: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        
        sampleWishes.forEach(wish => addWishToDisplay(wish));
        return;
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const wishes = await response.json();
        
        // Sort by timestamp (newest first)
        wishes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Display wishes
        wishes.forEach(wish => addWishToDisplay(wish));
    } catch (error) {
        console.error('Error loading wishes:', error);
    }
}

// Load wishes when page loads
document.addEventListener('DOMContentLoaded', loadWishes);

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Add animation to sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Hero section should be visible immediately
document.querySelector('.hero').style.opacity = '1';
document.querySelector('.hero').style.transform = 'translateY(0)';


// ============================================
// MUSIC PLAYER
// ============================================
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const welcomeScreen = document.getElementById('welcomeScreen');
const enterBtn = document.getElementById('enterBtn');
let isPlaying = false;

// Khi click vào nút mở thiệp
enterBtn.addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    playMusic();
});

musicBtn.addEventListener('click', toggleMusic);

function toggleMusic() {
    if (isPlaying) {
        bgMusic.pause();
        musicBtn.classList.remove('playing');
        isPlaying = false;
    } else {
        playMusic();
    }
}

function playMusic() {
    bgMusic.play().then(() => {
        musicBtn.classList.add('playing');
        isPlaying = true;
    }).catch(error => {
        console.log('Autoplay prevented:', error);
    });
}
