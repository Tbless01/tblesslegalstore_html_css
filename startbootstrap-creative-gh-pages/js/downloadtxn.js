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

        if (transactionResponse.status === 401 || transactionResponse.status === 403|| !transactionResponse.ok) {
            console.log('Token expired or unauthorized. Redirecting to home page...');
            localStorage.clear();  // Clear all local storage items
            window.location.href = 'google-login-page-for-txn.html';
            return;
        }

        // if (!transactionResponse.ok) {
        //     throw new Error('Failed to fetch transaction data');
        // }

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
                <td>${transaction.customerPackagePrice.toLocaleString()}</td>
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
document.getElementById("downloadPDFButton").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait', // 'landscape' if needed
        unit: 'px',
        format: 'a4'
    });



    // Prepare the content with better alignment
        const downloadContent = document.getElementById("downloadContent");
    downloadContent.innerHTML = [...document.querySelectorAll("#transactionDataBody tr")]
        .map((row, index) => `
            <div style="margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #ddd;">
                <h3 style="color: #4a4a4a; font-size: 18px; margin-bottom: 10px;"><strong>TLS</strong><br/> Transaction</h3>
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                    <tr style="border: 1px solid #ddd;">
                        <td style="width: 30%; font-weight: bold; padding: 10px; border: 1px solid #ddd;">Transaction Code:</td>
                        <td style="width: 70%; padding: 10px; border: 1px solid #ddd;">${row.cells[0].textContent}</td>
                    </tr>
                    <tr style="border: 1px solid #ddd;">
                        <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Package Name:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[1].textContent}</td>
                    </tr>
                    <tr style="border: 1px solid #ddd;">
                        <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Total Amount:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[2].textContent}</td>
                    </tr>
                    <tr style="border: 1px solid #ddd;">
                        <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Amount Paid:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[3].textContent}</td>
                    </tr>
                    <tr style="border: 1px solid #ddd;">
                        <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Balance:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[4].textContent}</td>
                    </tr>
                    <tr style="border: 1px solid #ddd;">
                        <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Date Last Payment:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[5].textContent}</td>
                    </tr>
                    <tr style="border: 1px solid #ddd;">
                        <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Status:</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[6].textContent}</td>
                    </tr>
                </table>
            </div>`).join('');






    // Configure PDF and generate content
    doc.html(downloadContent, {
        callback: function (doc) {
            doc.setFont("helvetica", "normal");  // Use professional-looking font
            doc.setTextColor(40, 40, 40);  // Dark gray text color
            doc.save("transaction-details.pdf");  // Save PDF
        },
        x: 30,  // Horizontal margin
        y: 20,  // Vertical margin
        html2canvas: { scale: 0.9 },  // Slight scaling for better fit
    });
});

// Call the function to fetch transaction data when the page loads
fetchTransactionData();
