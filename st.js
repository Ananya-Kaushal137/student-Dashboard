const recordForm = document.getElementById('record-form');
const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const emailInput = document.getElementById('email');
const courseInput = document.getElementById('course');
const phoneInput = document.getElementById('phone');
const recordList = document.getElementById('record-list');
const editIndexInput = document.getElementById('edit-index');
const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-btn');
const exportBtn = document.getElementById('export-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

// Pagination variables
let currentPage = 1;
const recordsPerPage = 5;
let filteredRecords = [];

// Initialize records from local storage
let records = JSON.parse(localStorage.getItem('records')) || [];

// Function to check for duplicate emails
function isDuplicateEmail(email, editIndex = -1) {
  return records.some(
    (record, index) => record.email.toLowerCase() === email.toLowerCase() && index !== editIndex
  );
}

// Function to update dashboard statistics
function updateStats() {
  const totalStudents = records.length;
  const recentAdditions = records.filter(record => {
    const addedDate = new Date(record.dateAdded);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return addedDate >= weekAgo;
  }).length;
  
  const avgAge = totalStudents > 0 ? 
    Math.round(records.reduce((sum, record) => sum + parseInt(record.age), 0) / totalStudents) : 0;

  document.getElementById('total-students').textContent = totalStudents;
  document.getElementById('recent-additions').textContent = recentAdditions;
  document.getElementById('avg-age').textContent = avgAge;
}

// Function to filter records based on search
function filterRecords() {
  const searchTerm = searchInput.value.toLowerCase();
  filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(searchTerm) ||
    record.email.toLowerCase().includes(searchTerm) ||
    record.course.toLowerCase().includes(searchTerm) ||
    record.phone.includes(searchTerm)
  );
  currentPage = 1;
  displayRecords();
}

// Function to get paginated records
function getPaginatedRecords() {
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  return filteredRecords.slice(startIndex, endIndex);
}

// Function to update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Display records with pagination
function displayRecords() {
  recordList.innerHTML = '';
  
  if (filteredRecords.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="6" style="text-align:center;color:#9ca3af;padding:2rem;">
      <i class="fas fa-inbox" style="font-size:2rem;margin-bottom:0.5rem;display:block;opacity:0.5;"></i>
      ${records.length === 0 ? 'No students registered yet' : 'No students found'}
    </td>`;
    recordList.appendChild(row);
  } else {
    const paginatedRecords = getPaginatedRecords();
    paginatedRecords.forEach((record, index) => {
      const actualIndex = records.indexOf(record);
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td style="font-weight: 500;">${record.name}</td>
        <td>${record.age}</td>
        <td style="color: #3b82f6;">${record.course}</td>
        <td style="color: #6b7280;">${record.email}</td>
        <td>${record.phone}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editRecord(${actualIndex})" title="Edit Student">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteRecord(${actualIndex})" title="Delete Student">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      recordList.appendChild(row);
    });
  }
  
  updatePagination();
  updateStats();
}

// Add or Update a record
recordForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const age = parseInt(ageInput.value);
  const email = emailInput.value.trim();
  const course = courseInput.value;
  const phone = phoneInput.value.trim();
  const editIndex = parseInt(editIndexInput.value);

  // Validation
  if (!name || !age || !email || !course || !phone) {
    alert('Please fill in all fields.');
    return;
  }

  if (age < 16 || age > 100) {
    alert('Please enter a valid age between 16 and 100.');
    return;
  }

  if (isDuplicateEmail(email, editIndex)) {
    alert('A student with this email already exists.');
    return;
  }

  const studentData = {
    name,
    age,
    email,
    course,
    phone,
    dateAdded: editIndex === -1 ? new Date().toISOString() : records[editIndex].dateAdded
  };

  if (editIndex === -1) {
    // Add a new record
    records.push(studentData);
    showNotification('Student added successfully!', 'success');
  } else {
    // Update an existing record
    records[editIndex] = studentData;
    editIndexInput.value = -1;
    document.querySelector('.submit-btn').innerHTML = '<i class="fas fa-plus"></i> Add Student';
    showNotification('Student updated successfully!', 'success');
  }

  localStorage.setItem('records', JSON.stringify(records));
  clearForm();
  filteredRecords = records;
  displayRecords();
});

// Clear form function
function clearForm() {
  nameInput.value = '';
  ageInput.value = '';
  emailInput.value = '';
  courseInput.value = '';
  phoneInput.value = '';
  editIndexInput.value = -1;
  document.querySelector('.submit-btn').innerHTML = '<i class="fas fa-plus"></i> Add Student';
}

// Edit a record
function editRecord(index) {
  const recordToEdit = records[index];
  nameInput.value = recordToEdit.name;
  ageInput.value = recordToEdit.age;
  emailInput.value = recordToEdit.email;
  courseInput.value = recordToEdit.course;
  phoneInput.value = recordToEdit.phone;
  editIndexInput.value = index;
  
  document.querySelector('.submit-btn').innerHTML = '<i class="fas fa-save"></i> Update Student';
  nameInput.focus();
  
  // Scroll to form
  document.querySelector('.left').scrollIntoView({ behavior: 'smooth' });
}

// Delete a record
function deleteRecord(index) {
  const deleteBtn = event.target.closest('.delete-btn');
  deleteBtn.innerHTML = `
    <i id="yesBtn" class="fa-solid fa-check" onclick="confirmDelete(${index})"></i>
    <i id="noBtn" class="fa-solid fa-xmark" onclick="resetDelete(${index})"></i>
  `;
}

function confirmDelete(index) {
  records.splice(index, 1);
  localStorage.setItem('records', JSON.stringify(records));
  filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
    record.email.toLowerCase().includes(searchInput.value.toLowerCase()) ||
    record.course.toLowerCase().includes(searchInput.value.toLowerCase()) ||
    record.phone.includes(searchInput.value)
  );
  
  // Adjust current page if necessary
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  
  displayRecords();
  showNotification('Student deleted successfully!', 'error');
}

function resetDelete(index) {
  displayRecords();
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'linear-gradient(135deg, #f44336, #d32f2f)'};
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  `;
  
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" style="margin-right: 10px;"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Export functionality
function exportToCSV() {
  if (records.length === 0) {
    alert('No data to export!');
    return;
  }

  const headers = ['Name', 'Age', 'Email', 'Course', 'Phone', 'Date Added'];
  const csvContent = [
    headers.join(','),
    ...records.map(record => [
      `"${record.name}"`,
      record.age,
      `"${record.email}"`,
      `"${record.course}"`,
      `"${record.phone}"`,
      `"${new Date(record.dateAdded).toLocaleDateString()}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `student_records_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  showNotification('Data exported successfully!', 'success');
}

// Event listeners
clearBtn.addEventListener('click', clearForm);
exportBtn.addEventListener('click', exportToCSV);
searchInput.addEventListener('input', filterRecords);

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayRecords();
  }
});

nextBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayRecords();
  }
});

// Add CSS animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initial setup
filteredRecords = records;
displayRecords();