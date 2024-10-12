// Fetch transaction data from the endpoint
async function fetchTransactionData() {
    const customerCode = localStorage.getItem('customerCode');
    const token = localStorage.getItem('token');

    try {
        const transactionResponse = await fetch(
            `https://drab-rozamond-tbless01-2ae1501e.koyeb.app/tblesslegalstore/v1/api/transactions/${customerCode}`, 
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (transactionResponse.status === 401 || transactionResponse.status === 403) {
            console.log('Token expired or unauthorized. Redirecting to home page...');
            localStorage.clear();  // Clear all local storage items
            window.location.href = 'google-login-page-for-txn.html';
            return;
        }

        if (!transactionResponse.ok) {
            throw new Error('Failed to fetch transaction data');
        }

        const transactionData = await transactionResponse.json();
        const transaction = transactionData.data;

        const packageResponse = await fetch(
            `https://drab-rozamond-tbless01-2ae1501e.koyeb.app/tblesslegalstore/v1/api/packages/${transaction.packageCode}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!packageResponse.ok) {
            throw new Error('Failed to fetch package data');
        }

        const packageData = await packageResponse.json();
        const packageName = packageData.data.packageName;

        const formattedDate = formatDate(transaction.dateLastPaymentMade);

        document.getElementById('transactionDataBody').innerHTML = `
            <tr>
                <td>${transaction.transactionCode}</td>
                <td>${packageName}</td>
                <td>${transaction.totalAmountPaid.toLocaleString()}</td>
                <td>${transaction.amountLastPaid.toLocaleString()}</td>
                <td>${transaction.balance.toLocaleString()}</td>
                <td>${formattedDate}</td>
                <td>${transaction.status}</td>
            </tr>
        `;
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('transactionDataBody').innerHTML = 
            `<tr><td colspan="7">Error fetching data</td></tr>`;
    }
}

// Format date function
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();

    const getSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        return ['th', 'st', 'nd', 'rd'][day % 10] || 'th';
    };

    const formattedDate = `${day}${getSuffix(day)} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

    return `${formattedDate} ${formattedTime}`;
}

// Download PDF
document.getElementById("downloadPDFButton").addEventListener("click", function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const downloadContent = document.getElementById("downloadContent");

    downloadContent.innerHTML = '';  // Clear previous content

    const rows = document.querySelectorAll("#transactionDataBody tr");
    rows.forEach(row => {
        downloadContent.innerHTML += `
            <div>
                <strong>Transaction Code:</strong> ${row.cells[0].textContent} <br>
                <strong>Package Name:</strong> ${row.cells[1].textContent} <br>
                <strong>Total Amount:</strong> ${row.cells[2].textContent} <br>
                <strong>Amount Paid:</strong> ${row.cells[3].textContent} <br>
                <strong>Balance:</strong> ${row.cells[4].textContent} <br>
                <strong>Date Last Payment Made:</strong> ${row.cells[5].textContent} <br>
                <strong>Status:</strong> ${row.cells[6].textContent}
            </div>
        `;
    });

    doc.html(downloadContent, {
        callback: function (doc) {
            doc.save("transaction-details.pdf");
        },
        x: 10,
        y: 10
    }).catch(err => console.error("Error generating PDF:", err));
});

// Download Image
document.getElementById("downloadImageButton").addEventListener("click", function() {
    const hiddenTable = document.getElementById("downloadContent");

    if (!hiddenTable.children.length) {
        console.error("No content to download");
        return;
    }

    html2canvas(hiddenTable).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = 'transaction-details.png';
        link.click();
    }).catch(err => console.error("Error generating image:", err));
});

// Call the function on page load
fetchTransactionData();
