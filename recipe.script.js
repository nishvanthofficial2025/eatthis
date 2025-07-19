document.addEventListener('DOMContentLoaded', () => {
    const recipeContainer = document.querySelector('.recipe-container');
    const recipeJSON = sessionStorage.getItem('eatasRecipeData');

    if (!recipeJSON) {
        recipeContainer.innerHTML = '<h1>Error</h1><p class="recipe-intro">No recipe data was found. Please go back and generate a meal analysis first.</p>';
        return;
    }

    try {
        // Data is already structured, just parse it from the string
        const recipeData = JSON.parse(recipeJSON);

        // Build the HTML using the structured data
        let html = `<h1>${recipeData.title}</h1>`;
        html += `<p class="recipe-intro">${recipeData.intro}</p>`;
        
        html += `<h2>Ingredients</h2><ul>`;
        recipeData.ingredients.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += `</ul>`;

        html += `<h2>Instructions</h2><ol>`;
        recipeData.instructions.forEach(step => {
            html += `<li>${step}</li>`;
        });
        html += `</ol>`;

        if(recipeData.chefTip) {
            html += `<h2>Chef's Pro Tip</h2><div class="chef-tip">${recipeData.chefTip}</div>`;
        }

        // Display the recipe on the page
        recipeContainer.innerHTML = html;

    } catch (error) {
        console.error("Failed to parse or render recipe data:", error);
        recipeContainer.innerHTML = '<h1>Error</h1><p class="recipe-intro">There was a problem displaying the recipe data.</p>';
    } finally {
        // Clean up the storage so the recipe doesn't appear again on refresh
        sessionStorage.removeItem('eatasRecipeData');
    }
});