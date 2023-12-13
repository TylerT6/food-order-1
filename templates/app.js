// app.js

// helps to prevent overcrowding

var calcController = (function() {
    //////////////// Private Methods ////////////////
    // constructor for incoming food items to the shopping cart order list

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            inc: []
        },

        totals: {
            inc: 0
        },

        balance: 0,

        MenuArray: [
            {'itemId':'PASTA1'  , 'itemName':'Spagetti'                   , 'itemPrice': 8.25}, 
            {'itemId':'PASTA2'  , 'itemName':'Lasagna'                    , 'itemPrice':12.75}, 
            {'itemId':'PASTA3'  , 'itemName':'Beef Bolognese Pappardelle' , 'itemPrice':17.95},
            {'itemId':'PIZZA1'  , 'itemName':'Pizza - Pepperoni, Sausage' , 'itemPrice':14.95},
            {'itemId':'PIZZA2'  , 'itemName':'Pizza - 3 Meat Combo'       , 'itemPrice':18.95},
            {'itemId':'PIZZA3'  , 'itemName':'Pizza - Veggie Combo'       , 'itemPrice':12.25},
            {'itemId':'DESSERT1', 'itemName':'Tiramisu'                   , 'itemPrice': 5.95},
            {'itemId':'DESSERT2', 'itemName':'Cannolis'                   , 'itemPrice': 4.95},
            {'itemId':'DESSERT3', 'itemName':'Spumoni Ice Cream'          , 'itemPrice': 4.25},
            {'itemId':'DRINK1'  , 'itemName':'Drink - Fresh Lemonade 16oz', 'itemPrice': 3.25},
            {'itemId':'DRINK2'  , 'itemName':'Drink - Bottled Water 16oz' , 'itemPrice': 2.75}
         ],
    };


    // Computes a total for inc type array of data.allItems on food order list.
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current, index, entireArray) {
            sum += current.value;
        });

        data.totals[type] = sum; 
    };

    return {

        addItem: function(type, des, val) {
            var newItem, ID;

            // Determine next avail id (max+1), remembering that
            // some array elements can be deleted as well as 
            // added. Sure, we could use Math.max(array.length)+1
            // but better is take shortcut since we ALSO know that
            // every time a new item ID gets added, we .push() it
            // onto the right end of the array stack. So only the
            // largest ID element is always the 'last' element.
            // Then add 1 to that.

            var whichArr = data.allItems[type];

            // Compute next ID sequence# to assign.
            checkLength = whichArr.length;
            if (checkLength > 0)
                ID = whichArr[whichArr.length - 1].id + 1;
            else
                // array is empty, cannot subtract 1 from length
                ID = 0;

            // Create new incoming item object
            if (type == 'inc') {
                newItem = new Income(ID, des, val);
            };

            // Push new object onto the correct array stack
            whichArr.push(newItem);

            // Return new obj to App module caller which will
            // then call UI module to display on web page.
            return newItem;
        },

        deleteItem: function(type, id) {
            var idArr, index;

            // Following returns a new array of just the id's 
            // in same order as the inc[] looped over.
         
            var idArr = data.allItems[type].map(function(ele) {
                return ele.id;
            }); 

            index = idArr.indexOf(id);  // returns -1 if not found
            if (index > -1)
            {
                // remove specified array element
                data.allItems[type].splice(index, 1);
            };

        },

        calculateBalance: function() {
            // pre-tax total of prices from all user's chosen food items
            calculateTotal('inc');
            data.balance = data.totals.inc;
        },

        getBalance: function() {
            return {
                balance: data.balance,
                totalInc: data.totals.inc
            };
        },

        getPriceOfMenuItem: function(descr) {
            return (data.MenuArray.find(c => c.itemName === descr));
        },

    };
})();


// USER INTERFACE CONTROLLER MODULE
// Design decisions:
//    Approach is to define a new property as an anonymous function
//    that returns a single literal object (containing properties) rather
//    than returning a bunch of variables. Each prop will store an HTML
//    field containing user input of food item choice:
//      item type, item descr, and price. 
//



///////// The encapsulates User Interface logic, doing something with user input. /////////

var UIController = (function() {

    //////////////// Private Properties ////////////////

    var DOMstrings = {
        // HTML tag class names to be called using document.querySelector()
        //  (REMEMBER: Must prefix each classname with '.')
        fldItemType: '.add__type',
        fldItemDescr: '.add__description',
        fldItemValue: '.add__value',
        fldAddBtn: '.add__btn',
        incomeContainer: '.income__list',
        fldBalanceNet: '.balance__value',
        fldBalanceInc: '.balance__income--value',
        container4Lists: '.container',
        fldCurrentMonthYear: '.balance__title--month',

        // HTML tag class names to be added/removed, not .querySelector
        // (FOLLOWING ARE NOT prefixed with comma)
        clsRedFocus: 'red-focus',
        clsRedConstant: 'red'
    };


    var formatNumber = function(num, type) {
        // remove sign, up front. we will be adding our own.
        var j, numStr, numSplitArr, intStr, decStr, reversed, expanded;
        const thousandsSep = ",";

        num = Math.abs(num);

        

        numStr = (Math.floor(num * 100)/100).toString();

        // split dollars into separate whole integer and decimal places (cents) portion
        numSplitArr = numStr.split('.')
        intStr = numSplitArr[0]; // string holds 'integer' portion
        decStr = numSplitArr[1]; // string holds 'decimal places' portion

        // if dollar price was entered without any cents then assign zeroes as the cents.
        if (typeof decStr === 'undefined')
            decStr = '00';

        j = 0;
        // add thousands separators every 3 digits
        if (intStr.length > 3) {
          
            reversed = intStr.split('').reverse();
            expanded = [];
            while (reversed.length>0) {
                j++;
                expanded.push(reversed.shift());
                // every 3rd digit, add a separator char
                if (j % 3 === 0)
                    expanded.push(thousandsSep);
            }
            intStr = expanded.reverse().join('');
        };
        return (type === 'inc' ? '+' : '-') + ' ' + intStr + '.' + decStr;
    };


    var nodeListForEach = function(node_list, callback) {
        for (var i=0; i < node_list.length; i++) {
            callback(node_list[i], i);
        };
    };

  
    return {
        

        getinput: function() {
           
            return {
                item_type: document.querySelector(DOMstrings.fldItemType).value, 
                item_description: document.querySelector(DOMstrings.fldItemDescr).value,
                item_value: parseFloat(document.querySelector(DOMstrings.fldItemValue).value)
            };
        },

        getinputDescrValueOnly: function() {
            // return JSON object of food description only
            return { 
                item_description: document.querySelector(DOMstrings.fldItemDescr).value,
                item_value: parseFloat(document.querySelector(DOMstrings.fldItemValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html;

            // Don't accept a zero cost (or non-numeric input) item from user.
            // This safety net early exits for that situation, bypassing add to order list.
            if (obj.value === 0)
                return;

            if (type === 'inc') {
                // incoming food item
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><img src="cancel_circle_32px.png" width="40%" height="auto"\></button></div></div></div>';
            };

            // Replace placeholder text with actual data values.
            var newHtml, element;
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);

            //formatNumber() is my custom func defined in above private section of this module.
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
            };


            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            // Although newer browsers support the newer .remove() method
            // older ES5 browsers (MSIE) do not. To maintain compatibility,
            // we will find the parent DOM HTML element then call
            // removeChild() instead. 

            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element); // must remove child from its parent node
        },

        clearFields: function() {

            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.fldItemDescr + ', ' + DOMstrings.fldItemValue);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, entireArr) {
                current.value = "";
            });

            
            fieldsArr[0].focus();
        },

        updateSelectorPrice: function(price) {
            document.querySelector(DOMstrings.fldItemValue).value = price; 
        },

        displayBalance: function(obj) {
            document.querySelector(DOMstrings.fldBalanceNet).textContent = formatNumber(obj.balance, (obj.balance > 0 ? 'inc' : 'exp'));
            document.querySelector(DOMstrings.fldBalanceInc).textContent = formatNumber(obj.totalInc, 'inc');
        },

        changeTypeFocusColor: function() {
            var userEntryNodes = document.querySelectorAll(
                DOMstrings.fldItemType + ',' + 
                DOMstrings.fldItemDescr + ',' + 
                DOMstrings.fldItemValue
            );
            var userAddBtn = document.querySelector(DOMstrings.fldAddBtn);
            var userEntryType = document.querySelector(DOMstrings.fldItemType);

            if (userEntryType.value === 'inc') {
                nodeListForEach(userEntryNodes, function(curr) {
                    curr.classList.remove(DOMstrings.clsRedFocus);
                });
            };

            document.querySelector(DOMstrings.fldAddBtn).classList.toggle(DOMstrings.clsRedConstant);
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();




var appController = (function(calcCtrl, UICtrl) {

    
    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMstrings();

       
        var updateBalance = function() {
            // 1. Calculate the balance summary
            calcCtrl.calculateBalance();

            // 2. Fetch the balance summary
            var balance = calcCtrl.getBalance();

            // 3. Display balance via the UI controller module.
            UICtrl.displayBalance(balance);
        };

        var updateItemPrice = function() {
            // 1. Fetch dropdown selector's current item name
            var inputDescrValueOnly = UICtrl.getinputDescrValueOnly();
            if (inputDescrValueOnly.item_description === '') {
                // dropdown selector is empty, skip rest
            } else {
                // 2. Lookup corresponding price from MenuArray
                var foundMenuArrayObj = calcCtrl.getPriceOfMenuItem(inputDescrValueOnly.item_description);

                // 3. Apply that price to field at rigth of dropdown selector.
                if(foundMenuArrayObj) {
                    UICtrl.updateSelectorPrice(foundMenuArrayObj.itemPrice);
                };
            };
        };

        var ctrlDeleteItem = function(event) {
   
            var itemDivId, splitID, type, ID;

            itemDivId= event.target.parentNode.parentNode.parentNode.parentNode.id;
          

            if (itemDivId)
            {
                splitID = itemDivId.split('-'); 
                type = splitID[0];
                ID = splitID[1]; // this is str, but really want integer

                // 2. delete item from our data structure.
                calcCtrl.deleteItem(type, parseInt(ID));

                // 3. delete item from the UI.
                UICtrl.deleteListItem(itemDivId);

                // 4. Update/display new balance summary totals.
               
                updateBalance();
            };

        };

        document.querySelector(DOM.container4Lists).addEventListener('click', ctrlDeleteItem);


        function truncateAfter2Decimals(x) {
            return Math.floor(parseFloat(x)*100)/100; 
        }
        var ctrlAddItem = function() {
            var input, newItem;

            input = UICtrl.getinput();

            // Validate required user inputs.
            // Early exit to reject entire trxn if no description or
            // no monetary value (or non-numeric) was specified.
            if ((input.item_description === '')||isNaN(input.item_value)||(input.item_value === 0)) {
                const errmsg = "Sorry, cannot accept item with missing description or invalid price.";
                alert(errmsg);
                return;
            };

            // remove leading/trailing whitespace.
            input.item_description = input.item_description.trim();

            // truncate any extraneous decimal places.
            input.item_value = truncateAfter2Decimals(input.item_value);

            // 2. Add item to the balance controller module.
            newItem = calcCtrl.addItem(input.item_type, input.item_description, input.item_value);

            // 3. Add item to the UI bottom region item list.
            UICtrl.addListItem(newItem, input.item_type);

            // 4. Clear the user input textboxes, setting focus back
            //    to first textbox. Makes ready for next user input.
            UICtrl.clearFields();

            // 5. Calculate/display balance summary at top of webpage.
            updateBalance();
        };

        document.querySelector(DOM.fldAddBtn).addEventListener('click', ctrlAddItem); 

        // Event listener 2 - Recognize ENTER key as add item btn click
        document.addEventListener('keypress', function(event) {
            // newer browsers have .keyCode, older browsers have .which
            if (event.keyCode === 13 || event.which === 13) {
                // console.log('ENTER key was pressed...');
                ctrlAddItem();
            };
        });

        // Event listener 3 - when user picks dropdown food choice, show menu price.
        document.querySelector(DOM.fldItemDescr).addEventListener('change', updateItemPrice); 

        document.querySelector(DOM.fldItemType).addEventListener('change', UICtrl.changeTypeFocusColor);

    };


    return {
        init: function() {
            console.log('Application has started.');
            setupEventListeners(); // listen for user input to HTML page
            UICtrl.displayBalance(calcCtrl.getBalance());
        }
    };

})(calcController, UIController); 

appController.init();