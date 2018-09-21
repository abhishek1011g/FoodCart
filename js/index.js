new Vue({
    el: '#app',
    data: function data() {
        return {
            menu: [],
            categories: [],
            organizedMenu: [],
            cart: []
        };
    },
    computed: {
        timeNow() {
            var d = new Date();
            return d.getHours();
        },
        cartTotal() {
            var total = 0;
            for (var i = 0; i < this.cart.length; i++) {
                total += this.cart[i].price * this.cart[i].count;
            }
            return total;
        }
    },
    mounted() {
        var cartData = localStorage.getItem('cart');
        if (cartData)
            this.cart = JSON.parse(cartData);

        var localMenu = localStorage.getItem('menu');
        if (localMenu) {
            this.menu = JSON.parse(localMenu);
            console.log("Fetching data from local storage...");
            this.organizeData();
        } else {
            axios.get("https://thesmartq.firebaseio.com/menu.json")
                .then(response => {
                    this.menu = response.data;
                    localStorage.setItem('menu', JSON.stringify(this.menu));
                    this.organizeData();
                })
        } //fetching Food Menu



    },
    methods: {
        organizeData() {
            // building categories.
            this.menu.forEach(Item => {
                var categorieIndex = this.categories.indexOf(Item.category);
                if (categorieIndex == -1) { // new category
                    this.categories.push(Item.category)
                    this.organizedMenu.push({
                        categoryName: Item.category,
                        categoryItems: [Item]
                    })
                } else {
                    this.organizedMenu[categorieIndex].categoryItems.push(Item);
                }
            });
        },
        isAvailable(item) {
            var timeRange = item.availabletime.split('-');
            var startTime = timeRange[0].split(':');
            var endTime = timeRange[1].split(':');
            var a = parseInt(startTime[0]);
            var b = parseInt(endTime[0]);
            if (this.timeNow >= a && this.timeNow <= b) {
                return true;
            } else
                return false;
        },
        generateID(str) {
            return str.replace(" ", "_");
        },
        addToCart(foodItem, operation) {
            if (this.isAvailable(foodItem)) {
                var find = false;
                for (let i = 0; i < this.cart.length; i++) {
                    var item = this.cart[i];
                    if (this.cart[i].name == foodItem.name) {
                        if (operation == 'add') {
                            item.count++;
                            Vue.set(this.cart, i, item)
                        } else {
                            item.count--;
                            Vue.set(this.cart, i, item)
                            if (this.cart[i].count == 0) {
                                // this.removeItem(item);
                                this.cart.splice(i, 1);
                            }
                        }
                        find = true;
                        break;
                    }
                }
                if (!find && operation == 'add') {
                    foodItem.count = 1;
                    this.cart.push(foodItem);
                }
                localStorage.setItem('cart', JSON.stringify(this.cart));
            }
        }
    },
    filters: { //To generate Icon
        firstChar: function(str) {
            var strs = str.split(" ");
            var msg2 = (strs.length > 1) ? strs[1].charAt(0) : '';
            return strs[0].charAt(0) + msg2;
        }
    }
});

VueScrollTo.setDefaults({
    container: "body",
    duration: 500,
    easing: "ease",
    offset: -100,
    cancelable: true,
    onStart: false,
    onDone: false,
    onCancel: false,
    x: false,
    y: true
})