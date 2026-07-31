// Import ang Firebase modules para sa Realtime Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getDatabase, ref, get, push, set } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-database.js";

// Firebase Configuration (Siguraduhing pareho ito sa admin dashboard mo)
const firebaseConfig = {
    apiKey: "AIzaSyAEG4geh7KlAFqE5N1KtcAccCKlhcG-n-g",
    authDomain: "rnr-tattoo-shop.firebaseapp.com",
    projectId: "rnr-tattoo-shop",
    storageBucket: "rnr-tattoo-shop.firebasestorage.app",
    messagingSenderId: "799117419992",
    appId: "1:799117419992:web:9fd467af02d5e7fceb3ead",
    measurementId: "G-CXM69TRZ1T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', async function() {
    
    // 1. Gallery Handler (Fetching from Firebase Realtime Database)
    const galleryGrid = document.getElementById('dynamic-gallery');
    if(galleryGrid) {
        try {
            const snapshot = await get(ref(database, 'rnr_gallery'));
            
            if(snapshot.exists()) {
                const data = snapshot.val();
                // I-convert ang Firebase object keys patungong array para madaling ma-loop
                const galleryItems = Object.keys(data).map(key => data[key]);
                
                galleryGrid.innerHTML = '';
                galleryItems.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.classList.add('gallery-item');
                    div.innerHTML = `
                        <img src="${item.image_url}" alt="RnR Tattoo Work" class="gallery-thumb" data-index="${index}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px; cursor: pointer; transition: transform 0.3s ease;">
                    `;
                    galleryGrid.appendChild(div);
                });

                setupLightbox(galleryItems, galleryGrid);
            } else {
                galleryGrid.innerHTML = `<p style="text-align:center; color:#777; grid-column:1/-1;">No tattoo works uploaded yet.</p>`;
            }
        } catch (error) {
            console.error('Error fetching gallery from Firebase:', error);
        }
    }

    // Lightbox Modal Setup with Next/Back Arrows
    function setupLightbox(galleryItems, galleryGrid) {
        const modal = document.createElement('div');
        modal.classList.add('lightbox-modal');
        modal.style.cssText = 'display:none; position:fixed; z-index:1000; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); justify-content:center; align-items:center;';
        modal.innerHTML = `
            <span class="lightbox-close" style="position:absolute; top:20px; right:30px; font-size:40px; color:#fff; cursor:pointer;">&times;</span>
            <button class="lightbox-arrow lightbox-prev" style="position:absolute; left:20px; background:none; border:none; color:#fff; font-size:40px; cursor:pointer;">&#10094;</button>
            <img class="lightbox-img" src="" alt="Fullscreen View" style="max-width:80%; max-height:80%; border-radius:4px;">
            <button class="lightbox-arrow lightbox-next" style="position:absolute; right:20px; background:none; border:none; color:#fff; font-size:40px; cursor:pointer;">&#10095;</button>
        `;
        document.body.appendChild(modal);

        const modalImg = modal.querySelector('.lightbox-img');
        const closeBtn = modal.querySelector('.lightbox-close');
        const prevBtn = modal.querySelector('.lightbox-prev');
        const nextBtn = modal.querySelector('.lightbox-next');

        let currentIndex = 0;

        function showImage(index) {
            if(index < 0) currentIndex = galleryItems.length - 1;
            else if(index >= galleryItems.length) currentIndex = 0;
            else currentIndex = index;
            modalImg.src = galleryItems[currentIndex].image_url;
        }

        galleryGrid.querySelectorAll('.gallery-thumb').forEach(img => {
            img.addEventListener('click', function() {
                currentIndex = parseInt(this.getAttribute('data-index'));
                showImage(currentIndex);
                modal.style.display = 'flex';
            });
        });

        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
        
        document.addEventListener('keydown', function(e) {
            if(modal.style.display === 'flex') {
                if(e.key === 'ArrowRight') showImage(currentIndex + 1);
                if(e.key === 'ArrowLeft') showImage(currentIndex - 1);
                if(e.key === 'Escape') modal.style.display = 'none';
            }
        });

        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = 'none'; });
    }

    // 2. Booking Handler (Saving to Firebase Realtime Database)
    const bookingForm = document.getElementById('booking-form');
    if(bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newBooking = {
                name: document.getElementById('client-name').value,
                contact: document.getElementById('client-email').value,
                artist: document.getElementById('preferred-artist').value,
                date: document.getElementById('booking-date').value,
                time: document.getElementById('booking-time').value,
                idea: document.getElementById('tattoo-idea').value,
                created_at: Date.now()
            };

            try {
                const newBookingRef = push(ref(database, 'rnr_appointments'));
                await set(newBookingRef, newBooking);

                const msgEl = document.getElementById('booking-msg');
                if(msgEl) {
                    msgEl.innerText = 'Appointment request sent successfully!';
                } else {
                    alert('Appointment request sent successfully!');
                }
                bookingForm.reset();
                if(msgEl) setTimeout(() => { msgEl.innerText = ''; }, 4000);
            } catch (error) {
                console.error('Error saving booking to Firebase:', error);
                alert('An error occurred while sending your booking.');
            }
        });
    }
});