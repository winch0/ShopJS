'use strict';
const form = document.getElementById('form');
const user = document.getElementById('user');
const password = document.getElementById('password');

function inputValueValidation(input, validations = []) {
    const { value } = input;
    let isValid = true;
    let error = '';

    validations.forEach(validation => {
    switch (validation) {
        case 'required':
        if (!value){
            isValid = !!value;
            error = `${input.name} es requerido`;
        }
        break;
    
        case 'register-user':
            if (value == ('cursojs')) {
                isValid = false;
                error = `${input.name} no registrado`;
            }
            break;
        case 'register-pass':
            if (value == ('test')) {
                isValid = false;
                error = `${input.name} no registrado`;
            }
            break;

    }
    });
    
    return { input, isValid, error };
}



function displayStatus(target, status, errorMessage = '') {
    target.style = `border-color: ${status ? 'green': 'red'};`
    const errorTarget = document.getElementById(`error-${target.name}`);
    errorTarget.innerText = errorMessage;
}



function onSubmit(evt) {
    evt.preventDefault();
    let isFormValid = true;
    const formData = [
    [user, ['required', 'register-user']],
    [password, ['required', 'register-pass']]
    ]
    formData.forEach(el => {
    const { input, isValid, error } = inputValueValidation(el[0], el[1]);
    if (!isValid) isFormValid = false;
    displayStatus(input, isValid, error);
    if (isFormValid) console.log('SUBMITTED !');
    });     
}
form.addEventListener('submit', onSubmit);




let cart = (JSON.parse(localStorage.getItem('cart')) || []);

const cartDOM = document.querySelector('.cart');
const addToCartButtonsDOM = document.querySelectorAll('[data-action="ADD_TO_CART"]');

//console.log(cart);

if(cart.length > 0){
    cart.forEach(cartItem => {
        const product = cartItem;
        insertItemToDOM(product);
        countCartTotal();

        addToCartButtonsDOM.forEach(addToCartButtonDOM => {
            const productDOM = addToCartButtonDOM.parentNode;

            if(productDOM.querySelector('.product__name').innerText === product.name){
                handleActionButtons(addToCartButtonDOM, product);
            }
        });
    });
}

addToCartButtonsDOM.forEach(addToCartButtonDOM => {
    addToCartButtonDOM.addEventListener('click', () => {
        const productDOM = addToCartButtonDOM.parentNode;
        const product = {
            image: productDOM.querySelector('.product__image').getAttribute('src'),
            name: productDOM.querySelector('.product__name').innerText,
            price: productDOM.querySelector('.product__price').innerText,
            quantity: 1,
        };

        const isInCart = (cart.filter(cartItem => (cartItem.name === product.name)).length > 0);

        if(!isInCart){
            insertItemToDOM(product);
            cart.push(product);
            saveCart();
            handleActionButtons(addToCartButtonDOM, product)
        }
        
    });
});


function insertItemToDOM(product){
    cartDOM.insertAdjacentHTML('beforeend', `
        <div class="cart__item">
            <img class="cart__item__image" src="${product.image}" alt="${product.name}">
            <h3 class="cart__item__name">${product.name}</h3>
            <h3 class="cart__item__price">${product.price}</h3>
            <button class="btn btn--primary btn--small${(product.quantity === 1 ? ' btn--danger' : '')}" data-action="DECREASE_ITEM">&minus;</button>
            <h3 class="cart__item__quantity">${product.quantity}</h3>
            <button class="btn btn--primary btn--small" data-action="INCREASE_ITEM">&plus;</button>
            <button class="btn btn--danger btn--small" data-action="REMOVE_ITEM">&times;</button>
        </div>
        
    `);

    addCartFooter();
}

function handleActionButtons(addToCartButtonDOM, product){
    addToCartButtonDOM.innerText = "In Cart"; 
    addToCartButtonDOM.disabled = true;

    const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
    cartItemsDOM.forEach(cartItemDOM => {                
        if(cartItemDOM.querySelector('.cart__item__name').innerText === product.name){
            
            cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => increaseItem(product, cartItemDOM));
            cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => decreaseItem(product, cartItemDOM, addToCartButtonDOM));
            cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => removeItem(product, cartItemDOM, addToCartButtonDOM));
        }
    });
}

function increaseItem(product, cartItemDOM){
    cart.forEach(cartItem => {
        if(cartItem.name === product.name){
            cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
            cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.remove('btn--danger');
            saveCart();
        }
    });
}

function decreaseItem(product, cartItemDOM, addToCartButtonDOM){
    cart.forEach(cartItem => {
        if(cartItem.name === product.name){
            if(cartItem.quantity > 1){
                cartItemDOM.querySelector('.cart__item__quantity').innerText = --cartItem.quantity;
                saveCart();
            }else{
                removeItem(product, cartItemDOM, addToCartButtonDOM)
            }
            if(cartItem.quantity === 1){
                cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.add('btn--danger');
            }
        }
    });
}

function removeItem(product, cartItemDOM, addToCartButtonDOM){
    cartItemDOM.classList.add('cart__item--removed')
    setTimeout(() => cartItemDOM.remove(), 300);
    cart = cart.filter(cartItem => cartItem.name !== product.name);
    saveCart();
    addToCartButtonDOM.innerText = 'Add To Cart';
    addToCartButtonDOM.disabled = false;

    if(cart.length < 1){
        document.querySelector('.cart-footer').remove();
    }
}

function addCartFooter(){
    if(document.querySelector('.cart-footer') === null){
        cartDOM.insertAdjacentHTML('afterend', `
        <div class="cart-footer">
            <button class="btn btn--danger" data-action="CLEAR_CART">Clear Cart</button>
            <h3 data-action="TOTAL"></h3>
            <h3 data-action="SEND"></h3>
            <button id="pbtn" class="btn btn--primary" data-action="CHECKOUT">Pay</button>
        </div>
    `);

    document.querySelector('[data-action="CLEAR_CART"]').addEventListener('click', () => clearCart());
    document.querySelector('[data-action="CHECKOUT"]').addEventListener('click', () => checkout());
    }

}

function clearCart(){
    cartDOM.querySelectorAll('.cart__item').forEach(cartItemDOM => {
        cartItemDOM.classList.add('cart__item--removed');
        setTimeout(() => cartItemDOM.remove(), 300);
    });
    cart = [];
    localStorage.removeItem('cart');
    document.querySelector('.cart-footer').remove();

    addToCartButtonsDOM.forEach(addToCartButtonDOM => {
        addToCartButtonDOM.innerText = 'Add To Cart';
        addToCartButtonDOM.disabled = false;
    });
}




function checkout() {
    const loadingText = document.getElementById('loading-text');
    loadingText.style = 'display:block;';
    setTimeout(() => {
        loadingText.style = 'display:none;';
        clearCart();
    }, 3000);
    
    }


function countSendTotal(){
    let sendTotal = 1.5;
    cart.forEach(cartItem => sendTotal += cartItem.quantity * 0.5);
    document.querySelector('[data-action="SEND"]').innerText = ` + Costo Envio $${sendTotal}`
}


function countCartTotal(){
    let cartTotal = 0;
    cart.forEach(cartItem => cartTotal += cartItem.quantity * cartItem.price);
    document.querySelector('[data-action="TOTAL"]').innerText = `Total $ ${cartTotal}`
}

function saveCart(){
    localStorage.setItem('cart', JSON.stringify(cart));
    countSendTotal();
    countCartTotal();
} 