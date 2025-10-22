require('dotenv').config();
const express = require('express');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'meals.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Auth Middleware
app.use(basicAuth({
  users: { 
    [process.env.AUTH_USERNAME || 'admin']: process.env.AUTH_PASSWORD || 'changeme' 
  },
  challenge: true,
  realm: 'MealTracker'
}));

// Ensure data directory and file exist
function ensureDataFile() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

// Read meals from file
function readMeals() {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Write meals to file
function writeMeals(meals) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(meals, null, 2));
}

// Serve static HTML page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meal Tracker</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">🍽️ Meal Tracker</h1>
        
        <!-- Add Meal Form -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-gray-700">Mahlzeiten für heute hinzufügen</h2>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Datum</label>
                    <input type="date" id="selectedDate" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           onchange="loadMealsForDate()">
                </div>

                <!-- Frühstück -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-2xl">🌅</span>
                        <h3 class="text-lg font-medium text-gray-700">Frühstück</h3>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" id="breakfast" placeholder="z.B. Müsli mit Früchten"
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <button onclick="saveMeal('Frühstück', 'breakfast')" 
                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200">
                            Speichern
                        </button>
                    </div>
                </div>

                <!-- Mittagessen -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-2xl">☀️</span>
                        <h3 class="text-lg font-medium text-gray-700">Mittagessen</h3>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" id="lunch" placeholder="z.B. Spaghetti Bolognese"
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <button onclick="saveMeal('Mittagessen', 'lunch')" 
                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200">
                            Speichern
                        </button>
                    </div>
                </div>

                <!-- Abendessen -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-2xl">🌙</span>
                        <h3 class="text-lg font-medium text-gray-700">Abendessen</h3>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" id="dinner" placeholder="z.B. Grillgemüse mit Reis"
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <button onclick="saveMeal('Abendessen', 'dinner')" 
                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200">
                            Speichern
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-gray-700">Filter & Suche</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Von Datum</label>
                    <input type="date" id="filterDateFrom"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Bis Datum</label>
                    <input type="date" id="filterDateTo"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Gericht suchen</label>
                <input type="text" id="searchDish" placeholder="z.B. Spaghetti, Pizza, Salat..."
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div class="mt-4 flex gap-2">
                <button onclick="applyFilter()" 
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                    Filter anwenden
                </button>
                <button onclick="clearFilter()" 
                        class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                    Filter zurücksetzen
                </button>
            </div>
        </div>

        <!-- Meals List -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold mb-4 text-gray-700">Mahlzeiten-Übersicht</h2>
            <div id="mealsList" class="space-y-3"></div>
        </div>
    </div>

    <script>
        let allMeals = [];

        // Set today's date as default
        document.getElementById('selectedDate').valueAsDate = new Date();

        // Load meals on page load
        loadMeals();
        loadMealsForDate();

        // Save meal function
        async function saveMeal(mealType, inputId) {
            const date = document.getElementById('selectedDate').value;
            const dish = document.getElementById(inputId).value.trim();
            
            if (!dish) {
                showNotification('Bitte geben Sie ein Gericht ein', 'error');
                return;
            }

            const meal = {
                date: date,
                mealType: mealType,
                dish: dish,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch('/api/meals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(meal)
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    if (result.replaced) {
                        // Show notification that meal was updated
                        showNotification(result.message, 'warning');
                    } else {
                        // Show success notification
                        showNotification('Mahlzeit erfolgreich hinzugefügt!', 'success');
                    }
                    
                    document.getElementById(inputId).value = '';
                    loadMeals();
                    loadMealsForDate();
                } else {
                    alert('Fehler beim Speichern der Mahlzeit');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Fehler beim Speichern der Mahlzeit');
            }
        }

        // Load meals for selected date and show in input fields
        async function loadMealsForDate() {
            const selectedDate = document.getElementById('selectedDate').value;
            if (!selectedDate) return;

            try {
                const response = await fetch('/api/meals');
                const meals = await response.json();
                
                // Clear all input fields first
                document.getElementById('breakfast').value = '';
                document.getElementById('lunch').value = '';
                document.getElementById('dinner').value = '';
                
                // Fill existing meals for the selected date
                meals.forEach(meal => {
                    if (meal.date === selectedDate) {
                        if (meal.mealType === 'Frühstück') {
                            document.getElementById('breakfast').value = meal.dish;
                        } else if (meal.mealType === 'Mittagessen') {
                            document.getElementById('lunch').value = meal.dish;
                        } else if (meal.mealType === 'Abendessen') {
                            document.getElementById('dinner').value = meal.dish;
                        }
                    }
                });
            } catch (error) {
                console.error('Error loading meals for date:', error);
            }
        }

        // Load and display meals
        async function loadMeals() {
            try {
                const response = await fetch('/api/meals');
                allMeals = await response.json();
                displayMeals(allMeals);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        // Display meals
        function displayMeals(meals) {
            const mealsList = document.getElementById('mealsList');
            
            if (meals.length === 0) {
                mealsList.innerHTML = '<p class="text-gray-500 text-center py-4">Noch keine Mahlzeiten erfasst.</p>';
                return;
            }

            // Sort meals by date (newest first)
            const sortedMeals = [...meals].sort((a, b) => 
                new Date(b.date) - new Date(a.date) || b.timestamp.localeCompare(a.timestamp)
            );

            // Group meals by date
            const groupedMeals = sortedMeals.reduce((groups, meal) => {
                const date = meal.date;
                if (!groups[date]) {
                    groups[date] = [];
                }
                groups[date].push(meal);
                return groups;
            }, {});

            let html = '';
            for (const [date, dateMeals] of Object.entries(groupedMeals)) {
                const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                html += \`
                    <div class="border-b border-gray-200 pb-4 mb-4">
                        <h3 class="font-semibold text-lg text-gray-800 mb-2">\${formattedDate}</h3>
                        <div class="space-y-2">
                \`;
                
                dateMeals.forEach(meal => {
                    const mealIcon = meal.mealType === 'Frühstück' ? '🌅' : 
                                   meal.mealType === 'Mittagessen' ? '☀️' : '🌙';
                    html += \`
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">\${mealIcon}</span>
                                <div>
                                    <span class="font-medium text-gray-700">\${meal.mealType}:</span>
                                    <span class="text-gray-600"> \${meal.dish}</span>
                                </div>
                            </div>
                            <button onclick="deleteMeal('\${meal.id}')" 
                                    class="text-red-600 hover:text-red-800 font-medium">
                                Löschen
                            </button>
                        </div>
                    \`;
                });
                
                html += \`
                        </div>
                    </div>
                \`;
            }

            mealsList.innerHTML = html;
        }

        // Delete meal
        async function deleteMeal(id) {
            if (!confirm('Möchtest du diese Mahlzeit wirklich löschen?')) {
                return;
            }

            try {
                const response = await fetch(\`/api/meals/\${id}\`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadMeals();
                } else {
                    alert('Fehler beim Löschen der Mahlzeit');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Fehler beim Löschen der Mahlzeit');
            }
        }

        // Apply filter
        function applyFilter() {
            const dateFrom = document.getElementById('filterDateFrom').value;
            const dateTo = document.getElementById('filterDateTo').value;
            const searchTerm = document.getElementById('searchDish').value.trim().toLowerCase();

            let filtered = allMeals;

            if (dateFrom) {
                filtered = filtered.filter(meal => meal.date >= dateFrom);
            }
            if (dateTo) {
                filtered = filtered.filter(meal => meal.date <= dateTo);
            }
            if (searchTerm) {
                filtered = filtered.filter(meal => 
                    meal.dish.toLowerCase().includes(searchTerm)
                );
            }

            displayMeals(filtered);
        }

        // Clear filter
        function clearFilter() {
            document.getElementById('filterDateFrom').value = '';
            document.getElementById('filterDateTo').value = '';
            document.getElementById('searchDish').value = '';
            displayMeals(allMeals);
        }

        // Add real-time search functionality
        document.getElementById('searchDish').addEventListener('input', applyFilter);

        // Show notification function
        function showNotification(message, type = 'info') {
            // Remove existing notification if any
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md';
            
            if (type === 'success') {
                notification.classList.add('bg-green-500', 'text-white');
            } else if (type === 'warning') {
                notification.classList.add('bg-yellow-500', 'text-white');
            } else if (type === 'error') {
                notification.classList.add('bg-red-500', 'text-white');
            } else {
                notification.classList.add('bg-blue-500', 'text-white');
            }

            notification.innerHTML = \`
                <div class="flex items-center justify-between">
                    <span>\${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 font-bold">×</button>
                </div>
            \`;

            document.body.appendChild(notification);

            // Auto-remove notification after 5 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    </script>
</body>
</html>
  `);
});

// API Routes

// Get all meals
app.get('/api/meals', (req, res) => {
  try {
    const meals = readMeals();
    res.json(meals);
  } catch (error) {
    console.error('Error reading meals:', error);
    res.status(500).json({ error: 'Failed to read meals' });
  }
});

// Add new meal
app.post('/api/meals', (req, res) => {
  try {
    const { date, mealType, dish } = req.body;
    
    if (!date || !mealType || !dish) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const meals = readMeals();
    
    // Check if a meal of the same type already exists for this date
    const existingMealIndex = meals.findIndex(meal => 
      meal.date === date && meal.mealType === mealType
    );

    if (existingMealIndex !== -1) {
      // Replace existing meal
      const existingMeal = meals[existingMealIndex];
      meals[existingMealIndex] = {
        ...existingMeal,
        dish,
        timestamp: new Date().toISOString()
      };
      writeMeals(meals);
      res.json({ 
        meal: meals[existingMealIndex], 
        replaced: true, 
        message: `${mealType} für ${date} wurde aktualisiert` 
      });
    } else {
      // Add new meal
      const newMeal = {
        id: Date.now().toString(),
        date,
        mealType,
        dish,
        timestamp: new Date().toISOString()
      };
      meals.push(newMeal);
      writeMeals(meals);
      res.status(201).json({ meal: newMeal, replaced: false });
    }
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ error: 'Failed to add meal' });
  }
});

// Delete meal
app.delete('/api/meals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const meals = readMeals();
    const filteredMeals = meals.filter(meal => meal.id !== id);
    
    if (meals.length === filteredMeals.length) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    writeMeals(filteredMeals);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Meal Tracker running on port ${PORT}`);
  console.log(`Username: ${process.env.AUTH_USERNAME || 'admin'}`);
});
