document.addEventListener("DOMContentLoaded", () => {
    const addServiceForm = document.getElementById("add-menu-item-form"); // форма оставляем той же
    const logoutBtn = document.getElementById("logout-btn");
    const servicesContainer = document.querySelector("#menu-items-container"); // контейнер оставляем
    const editItemIdInput = document.getElementById("edit-item-id");
    const addBtn = document.getElementById("add-btn");
    const updateBtn = document.getElementById("update-btn");

    const fetchServices = async () => {
        try {
            const response = await fetch("/services");
            const services = await response.json();
            renderServices(services);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const renderServices = (services) => {
        servicesContainer.innerHTML = '';
        services.forEach(item => {
            const serviceElement = document.createElement('div');
            serviceElement.classList.add('menu__item');
            serviceElement.innerHTML = `
                <img src="../${item.img}" alt="${item.altimg}">
                <div class="menu__item-content">
                    <h3 class="menu__item-subtitle">${item.title}</h3>
                    <div class="menu__item-descr">${item.descr}</div>
                    <div class="menu__item-price">
                        <div class="menu__item-cost">Цена</div>
                        <div class="menu__item-total"><span>${item.price}</span> евро/день</div>
                    </div>
                </div>
                <div class="menu__item-actions">
                    <button class="btn btn-primary btn-sm edit-btn" data-id="${item._id}">Редактировать</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${item._id}">Удалить</button>
                </div>
            `;
            servicesContainer.appendChild(serviceElement);
        });
    };

    addServiceForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(addServiceForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Service added successfully");
                addServiceForm.reset();
                fetchServices();
            } else {
                alert("Failed to add service. Please try again.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred. Please try again.");
        }
    });

    updateBtn.addEventListener("click", async () => {
        const itemId = editItemIdInput.value;
        const formData = new FormData(addServiceForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/services/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Service updated successfully");
                addServiceForm.reset();
                fetchServices();
                addBtn.style.display = "block";
                updateBtn.style.display = "none";
            } else {
                alert("Failed to update service. Please try again.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred. Please try again.");
        }
    });

    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/logout", { method: "POST" });
            if (response.ok) window.location.href = "/";
            else alert("Failed to logout. Please try again.");
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred. Please try again.");
        }
    });

    servicesContainer.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const itemId = e.target.dataset.id;
            if (confirm("Are you sure you want to delete this service?")) {
                try {
                    const response = await fetch(`/services/${itemId}`, { method: "DELETE" });
                    if (response.ok) fetchServices();
                    else alert("Failed to delete service.");
                } catch (error) {
                    console.error('Error:', error);
                    alert("An error occurred.");
                }
            }
        }

        if (e.target.classList.contains("edit-btn")) {
            const itemId = e.target.dataset.id;
            const response = await fetch('/services');
            const services = await response.json();
            const selectedItem = services.find(item => item._id === itemId);

            if (selectedItem) {
                document.getElementById("img").value = selectedItem.img;
                document.getElementById("altimg").value = selectedItem.altimg;
                document.getElementById("title").value = selectedItem.title;
                document.getElementById("descr").value = selectedItem.descr;
                document.getElementById("price").value = selectedItem.price;
                editItemIdInput.value = selectedItem._id;

                addBtn.style.display = "none";
                updateBtn.style.display = "block";
            }
        }
    });

    fetchServices();
});
