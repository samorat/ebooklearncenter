// !!!!!!!!!!!!! สำคัญมาก !!!!!!!!!!!!!
// วาง "Web app URL" เดิมของคุณตรงนี้
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxtMB2-a8hSXerCZVXCn1a-AHmbZwgQYaK0gzVE_xsm1zn9kz9Hz-Ytq_hPJ1roI7Ah/exec";


const form = document.getElementById("contactForm");
const submitButton = document.getElementById("submitButton");
const formStatus = document.getElementById("formStatus");

// ดึง Input elements และ Error elements
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const subjectInput = document.getElementById("subject");
const messageInput = document.getElementById("message");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const subjectError = document.getElementById("subjectError");
const messageError = document.getElementById("messageError");

/**
 * ฟังก์ชันสำหรับแสดง Error
 */
function setError(inputElement, errorElement, message) {
    inputElement.classList.add("invalid");
    errorElement.textContent = message;
    errorElement.classList.add("show");
}

/**
 * ฟังก์ชันสำหรับล้าง Error
 */
function clearError(inputElement, errorElement) {
    inputElement.classList.remove("invalid");
    errorElement.textContent = "";
    errorElement.classList.remove("show");
}

/**
 * ฟังก์ชันตรวจสอบความถูกต้องของอีเมล (Regex)
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * ฟังก์ชันตรวจสอบฟอร์มทั้งหมด
 */
function validateForm() {
    let isValid = true;

    // 1. ล้าง Error เก่าทั้งหมดก่อน
    clearError(nameInput, nameError);
    clearError(emailInput, emailError);
    clearError(subjectInput, subjectError);
    clearError(messageInput, messageError);

    // 2. ตรวจสอบชื่อ
    if (nameInput.value.trim() === "") {
        setError(nameInput, nameError, "กรุณากรอกชื่อ-นามสกุล");
        isValid = false;
    }

    // 3. ตรวจสอบอีเมล
    if (emailInput.value.trim() === "") {
        setError(emailInput, emailError, "กรุณากรอกอีเมล");
        isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
        setError(emailInput, emailError, "รูปแบบอีเมลไม่ถูกต้อง");
        isValid = false;
    }
    
    // 4. ตรวจสอบหัวข้อ
    if (subjectInput.value.trim() === "") {
        setError(subjectInput, subjectError, "กรุณากรอกหัวข้อเรื่อง");
        isValid = false;
    }

    // 5. ตรวจสอบข้อความ
    if (messageInput.value.trim() === "") {
        setError(messageInput, messageError, "กรุณากรอกข้อความ");
        isValid = false;
    }

    return isValid;
}


// --- Event Listener หลัก ---
form.addEventListener("submit", function(event) {
    event.preventDefault(); 

    if (!validateForm()) {
        formStatus.textContent = "กรุณากรอกข้อมูลให้ครบถ้วน";
        formStatus.className = "status-error";
        return; 
    }

    formStatus.textContent = "กำลังส่งข้อมูล...";
    formStatus.className = ""; 
    submitButton.disabled = true; // ปิดปุ่ม

    const formData = new FormData(form);
    const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        subject: formData.get("subject"), 
        company: formData.get("company"), 
        message: formData.get("message")
    };

    // 4. ส่งข้อมูลไปยัง Google Apps Script
    fetch(GAS_WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
    })
    .then(response => response.json())
    .then(result => {
        if (result.result === "success") {
            // ---- START: ส่วนที่อัปเดต ----
            
            formStatus.textContent = "ส่งข้อความเรียบร้อย! กำลังนำคุณกลับสู่หน้าหลัก...";
            formStatus.className = "status-success";
            form.reset(); 
            // เราจะไม่เปิดปุ่ม (submitButton.disabled = false) ที่นี่
            // เพราะเรากำลังจะเปลี่ยนหน้า

            // หน่วงเวลา 2.5 วินาทีเพื่อให้ผู้ใช้อ่านข้อความ
            setTimeout(() => {
                window.location.href = "https://www.locallearncenter.com/home.html";
            }, 2500); // 2500 มิลลิวินาที = 2.5 วินาที
            
            // ---- END: ส่วนที่อัปเดต ----
            
        } else {
            // ถ้า Error จากฝั่ง Server (เช่น GAS)
            throw new Error(result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
        }
    })
    .catch(error => {
        // ถ้า Error จาก Network หรือ .then() บล็อกบน
        console.error("Error:", error);
        formStatus.textContent = "เกิดข้อผิดพลาด: " + error.message;
        formStatus.className = "status-error";
        
        // ---- START: ส่วนที่อัปเดต ----
        // เปิดปุ่มให้กดใหม่ เฉพาะในกรณีที่เกิด Error เท่านั้น
        submitButton.disabled = false;
        // ---- END: ส่วนที่อัปเดต ----
    });
    
    // สังเกตว่าเราลบ .finally() ออกไป
    // เพราะเราต้องการควบคุมการเปิด/ปิดปุ่มเอง
    // (คือ: ถ้าสำเร็จ ให้ปิดค้างไว้, ถ้าล้มเหลว ให้เปิดใหม่)
});