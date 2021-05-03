
<!-- comentario para cambio -->
<template>

    <div class="planogram-editor">

        <v-toolbar class="mb-3" color="grey-darken-1" dark>
            <v-scale-transition>
                <v-app-bar-nav-icon>
                <v-icon>fas fa-mobile-alt</v-icon>
                </v-app-bar-nav-icon>
            </v-scale-transition>
            <v-scroll-y-transition>
                <v-toolbar-title> Editor de Planogramas </v-toolbar-title>
            </v-scroll-y-transition>
            <v-spacer></v-spacer>
            <v-scale-transition>
                <v-btn
                v-if="!searchMode"
                :color="$vuetify.breakpoint.xsOnly ? 'none' : '#55AA99'"
                :icon="$vuetify.breakpoint.xsOnly ? true : false"
                class="mx-1"
                :disabled="loading"
                to="/pantallas/planogramas"
                >
                <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
                    fas fa-th-list
                </v-icon>
                {{ !$vuetify.breakpoint.xsOnly ? "Ver lista" : "" }}
                </v-btn>
            </v-scale-transition>
        </v-toolbar>

        <!-- Snackbar http status messages -->
        <v-scale-transition>

            <v-snackbar v-model="snackbar" :color="snackbarColor" top right>
                {{ snackbarText }}

                <template v-slot:action="{ attrs }">
                <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
                    Cerrar
                </v-btn>
                </template>
            </v-snackbar>

        </v-scale-transition>

        <!--==== PLANOGRAM MANAGEMENT ====-->
        <v-row class="main-management">

            <v-menu
                v-model="menu"
                :close-on-content-click="false"
                :close-on-click="true"
                :position-x="menu_x"
                :position-y="menu_y"
                class="main-menu"
            >
                <v-list v-if="menuShelfShow">

                    <v-list-item disabled>

                        <v-list-item-content>
                            <v-list-item-title>Enviar a:</v-list-item-title>
                        </v-list-item-content>

                    </v-list-item>

                    <v-list-item v-for="(s, index) in shelves" :key="`AvailableShelf-${index}`">

                        <v-list-item-content>
                            <v-list-item-title>Estante {{ index + 1 }}</v-list-item-title>
                        </v-list-item-content>

                        <v-list-item-action>
                            <v-btn @click="sendToShelf(index)" icon>
                                <v-icon>fas fa-arrow-alt-circle-right</v-icon>
                            </v-btn>
                        </v-list-item-action>

                    </v-list-item>

                </v-list>

                <v-alert v-else type="warning" class="menu-alert" color="#FFA440" icon="fas fa-exclamation-triangle">

                    {{this.menuText}}

                </v-alert>

            </v-menu>

            <!-- BOX PRODUCTS -->
            <v-col cols="12" sm="4" class="main-products">
                <!-- <v-row dense>
                <v-col cols="12">
                    <v-sheet color="secondary" class="main-title">
                    Productos
                    </v-sheet>
                </v-col>
                </v-row> -->
                <!-- <v-row dense> -->
                <v-col cols="12" class="main-products-col">
                <ProductListInfiniteScroll @itemSelected="handleProduct" />
                </v-col>
                <!-- </v-row> -->
            </v-col>
            <!-- BOX PRODUCTS -->


            <!-- PLANOGRAM PREVIEW -->
            <v-col cols="12" sm="3" class="main-planogram">
                <!-- <v-row class="d-flex flex-column" dense> -->
                <!-- <v-col cols="12">
                    <v-sheet color="secondary" class="main-title">
                    Planograma
                    </v-sheet>
                </v-col> -->
                <!-- <v-col cols="12" class="d-flex justify-center"> -->
                <!-- Planogram -->
                <vdr
                    :w="planogramWidth"
                    :h="planogramHeight"
                    :parent="false"
                    :debug="false"
                    :min-width="planogramWidth + 1"
                    :min-height="planogramHeight"
                    :isConflictCheck="false"
                    :snap="false"
                    :draggable="false"
                    :resizable="false"
                    :z="100"
                    :handles="[]"
                    class="ma-0 pa-0 class-planogram-propia"
                    id="__PLANOGRAM_VDR"
                >
                    <img
                        v-if="planogramSrc && planogramSrc.match(/.(jpg|jpeg)$/i)"
                        :src="planogramSrc"
                        alt=" "
                        class="planogram__background ma-0 pa-0"
                    />

                    <!-- TODO: Integrate video component -->
                    <!-- <video
                        v-else-if="planogramSrc.match(/.(mp4)$/i)"
                        class="planogram__background ma-0 pa-0"
                    >
                        <source :src="planogramSrc" type="video/mp4" />
                        Su navegador no soporta la etiqueta de video HTML5.
                    </video> -->

                    <!-- Shelves  -->
                    <vdr
                        v-for="(shelf, index) in shelves"
                        v-bind:key="`shelf-${index}`"
                        class="ma-0 pa-0"
                        :style="`borderColor: ${rgba(shelf.color)}; border: none; backgroundColor: rgba(15,15,15,.1)`"
                        :id="`vdr_shelf-${index}`"
                        :x="0"
                        :y="Math.round(shelf.originY)"
                        :w="planogramWidth"
                        :h="+shelf.h"
                        :resizable="false"
                        :draggable="shelf_active"
                        :lock-aspect-ratio="false"
                        :grid="[1, 1]"
                        :parent="true"
                        :active="shelf_active"
                        :handles="['tm', 'mr']"
                        class-name-dragging="shelf__dragging"
                        :debug="false"
                        :isConflictCheck="true"
                        :z="101"
                        :snap="true"
                        :snap-tolerance="4"
                        axis="y"
                        @dragging="( left, top ) => xy( 'Shelf', left, top, shelf, index, 0 )"
                        @dragstop="( left, top ) => dragStopOffsets( left, top, shelf, 'Shelf', index, index )"
                        @created="( left, top ) => setInitialOffsets( left, top, shelf, 'Shelf', index, 0 )"
                    >

                        <!-- <div
                            v-for="(product, pos) in shelf.storedProducts"
                            v-bind:key="`product-${pos*componentKey}`"
                            :style="`position:absolute; left: ${product.size.originX}px; top: ${product.size.originY}px; width: ${product.size.w}px; height: ${product.size.h}px; background-color: red;`"
                        >
                            A
                        </div> -->
                        <vdr
                            v-for="(product, pos) in shelf.storedProducts"
                            v-bind:key="`product-${pos}`"
                            v-bind:id="`_SP_VDR-${index}-${pos}`"
                            :style="'border: none;'"
                            :x="Math.round(product.size.originX)"
                            :y="Math.round(product.size.originY)"
                            :w="Math.round(product.size.w)"
                            :h="Math.round(product.size.h)"
                            :min-width="10"
                            :min-height="10"
                            :resizable="true"
                            :draggable="true"
                            :lock-aspect-ratio="true"
                            :parent="true"
                            @activated="shelf_active = false"
                            @deactivated="shelf_active = true"
                            class-name-dragging="shelf__dragging"
                            :isConflictCheck="true"
                            :debug="false"
                            :z="102"
                            :snap="true"
                            :snap-tolerance="2"
                            :handles="['tl']"
                            axis="x"
                            @updated="( ...args ) => updatedProduct( index, pos, args )"
                            @beforeUpdate="( ...args ) => beforeUpdateProduct( index, pos, args )"
                            @dragging="( left, top ) => xy( 'Product', left, top, product, index, pos )"
                            @dragstop="( left, top ) => dragStopOffsets( left, top, product, 'Product', index, pos )"
                            @resizestop="( x, y, width, height ) => tweakOnResize( index, pos, product, x, y, width, height )"
                            @created="( left, top ) => setInitialOffsets( left, top, product, 'Product', index, pos )"
                        >
                            <div class="d-flex justify-content-center ma-0" :style="{ height: `100%`, 'max-width': `100%` }">
                                <img class="shelf_img" v-bind:src="product.archivos[0].url || require('@/assets/no-disponible.jpg')"/>
                            </div>

                        </vdr>
                        
                        <!-- Shelf base -->
                        <!-- <div class="d-flex ma-0" :style="{ height: `${shelf.h}px` }"> -->
                        <div
                            class="d-flex ma-0"
                            :style="{ position: 'absolute', bottom: 0 }"
                        >
                            <v-sheet
                                class="align-self-end my-class-base-shelf"
                                :width="planogramWidth"
                                :height="6"
                                :color="rgba(shelf.color)"
                            >
                                <div class="shelf-actions-left text-overline text-center">
                                    <div class="text-overline">{{ index + 1 }}</div>
                                </div>

                                <div class="shelf-actions-right">
                                    <v-btn
                                        color="red"
                                        @click="removeShelf( index )"
                                        small
                                        text
                                        icon
                                    >
                                        <v-icon>fas fa-trash-alt</v-icon>
                                    </v-btn>

                                </div>

                            </v-sheet>
                            
                        </div>

                    </vdr>

                </vdr>
                <!-- </v-col> -->

                <!-- </v-row> -->
            </v-col>
            <!-- PLANOGRAM PREVIEW -->


            <!-- PLANOGRAM SETTINGS -->
            <v-col cols="12" md="5" class="main-settings">

                <v-form v-model="isFormValid">

                    <v-row class="d-flex flex-column justify-center" dense>
                        <!-- <v-col cols="12">
                        <v-sheet color="secondary" class="main-title">
                            Configuración del planograma
                        </v-sheet>
                        </v-col> -->
                        <v-row dense>
                        <v-col cols="12" class="d-flex flex-column">
                            <div class="text-h6 text-left">Parámetros</div>
                            <v-divider class="my-1"></v-divider>
                        </v-col>
                        </v-row>

                        <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-text-field
                            v-model="editedItem.nombre"
                            label="Nombre"
                            maxlength="35"
                            hint="Al menos 5 caracteres."
                            :rules="[rules.required, rules.min]"
                            filled
                            clearable
                            dense
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                            v-model="editedItem.titulo"
                            label="Título"
                            maxlength="35"
                            hint="Al menos 5 caracteres."
                            :rules="[rules.required, rules.min]"
                            filled
                            clearable
                            dense
                            ></v-text-field>
                        </v-col>
                        </v-row>

                        <v-row dense>
                        <v-col cols="6">
                            <div class="text-h6 text-left">Fondo</div>
                        </v-col>
                        <v-col cols="6" class="d-flex justify-end">
                            <v-dialog
                            v-model="dialogGallery"
                            width="85%"
                            overlay-color="blue"
                            overlay-opacity="0.2"
                            scrollable
                            persistent
                            >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                color="success"
                                dark
                                small
                                v-bind="attrs"
                                v-on="on"
                                width="148px"
                                :disabled="loading"
                                :loading="loading"
                                >
                                Elegir fondo
                                </v-btn>
                            </template>

                            <v-card height="auto">
                                <v-card-title>Elegir un fondo</v-card-title>
                                <v-divider></v-divider>
                                <v-card-text>
                                <!-- Gallery component -->
                                <simple-gallery
                                    :paginationFixed="false"
                                    @fileSelected="getChildData"
                                >
                                </simple-gallery>
                                </v-card-text>
                                <v-divider></v-divider>
                                <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="info"
                                    text
                                    @click="
                                    dialogGallery = false;
                                    backgroundId = -1;
                                    backgroundData = {};
                                    "
                                    :disabled="loading || requesting"
                                    :loading="loading || requesting"
                                >
                                    Cerrar
                                </v-btn>
                                </v-card-actions>
                            </v-card>
                            </v-dialog>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                        </v-row>

                        <v-row dense>
                        <v-col cols="6">
                            <div class="text-h6 text-left">Estantes</div>
                        </v-col>
                        <v-col cols="6" class="d-flex justify-end">
                            <v-btn
                            @click="addShelf"
                            :disabled="loading || (shelf_h < 10 || shelf_h > 100)"
                            :loading="loading"
                            color="#55AA99"
                            dark
                            small
                            width="148px"
                            >
                            Agregar estante
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                        </v-row>

                        <v-row dense class="mt-2">
                        <v-col cols="12" sm="6">
                            <v-text-field
                            label="Color de la base"
                            placeholder="Seleccionar un color..."
                            :value="rgba(shelf_color)"
                            @click.stop="dialogColor = true"
                            filled
                            dense
                            hide-details
                            readonly
                            clearable
                            >
                            </v-text-field>
                            <v-dialog
                            v-model="dialogColor"
                            width="384"
                            overlay-color="blue"
                            overlay-opacity="0.2"
                            persistent
                            >
                            <v-card height="auto" color="#272727">
                                <v-card-title> Color de la base del estante </v-card-title>
                                <v-divider></v-divider>
                                <v-card-text class="d-flex justify-center pa-3">
                                <v-color-picker
                                    v-model="shelf_color"
                                    label="Color de la base"
                                    dot-size="24"
                                    mode="rgba"
                                    show-swatches
                                    swatches-max-height="128"
                                    hide-mode-switch
                                ></v-color-picker>
                                </v-card-text>
                                <v-divider></v-divider>
                                <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text color="info" @click="dialogColor = false">
                                    Cerrar
                                </v-btn>
                                </v-card-actions>
                            </v-card>
                            </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                type="number"
                                v-model.number="shelf_h"
                                label="Altura del estante"
                                :hint="`El porcentaje mínimo: ${minShelfHeight}%`"
                                :rules="[rules.shelfMin, rules.shelfMax]"
                                :step="5"
                                :min="10"
                                :max="100"
                                filled
                                clearable
                                dense
                            ></v-text-field>
                        </v-col>
                        </v-row>

                        <v-row dense>

                            <v-col class="btn-delete" cols="12" sm="6" v-if="editedId > -1">
                                <v-btn
                                large
                                block
                                color="danger"
                                :disabled="loading"
                                :loading="loading"
                                @click.stop="dialogDelete = true"
                                >
                                <v-icon class="mr-2">fas fa-trash-alt</v-icon>
                                <div class="btn-delete-text">Eliminar</div>
                                </v-btn>
                                <v-dialog
                                v-model="dialogDelete"
                                persistent
                                overlay-color="blue"
                                overlay-opacity="0.2"
                                width="384"
                                >
                                <v-card height="auto">
                                    <v-card-title>¿Desea eliminar el planograma?</v-card-title>
                                    <v-divider></v-divider>
                                    <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="info" @click="dialogDelete = false">
                                        Cerrar
                                    </v-btn>
                                    <v-btn
                                        color="info"
                                        @click="deletePlanogram"
                                        :loading="loading"
                                        :disabled="loading"
                                    >
                                        Aceptar
                                    </v-btn>
                                    </v-card-actions>
                                </v-card>
                                </v-dialog>
                            </v-col>

                            <v-col class="btn-save" cols="12" sm="6">

                                <v-btn
                                    large
                                    block
                                    color="success"
                                    :disabled="loading || !isFormValid"
                                    :loading="loading"
                                    @click="save"
                                >
                                    <v-icon class="mr-2">fas fa-save</v-icon>
                                    <div class="btn-save-text">Guardar</div>
                                </v-btn>

                            </v-col>
                            
                        </v-row>

                    </v-row>

                </v-form>

            </v-col>
            <!-- PLANOGRAM SETTINGS -->

        </v-row>
        <!--==== PLANOGRAM MANAGEMENT ====-->

    </div>

</template>


<script>

    import SimpleGallery from "../../components/SimpleGallery";
    import ProductListInfiniteScroll from "../../components/ProductListInfiniteScroll.vue";

    export default {

        name: "PlanogramEditor",
        components: { SimpleGallery, ProductListInfiniteScroll },

        data: () => ({

            componentKey: 10,

            width: 40,
            height: 40,
            x: 0,
            y: 0,
            shelf_x: 0,
            shelf_y: 0,
            shelf_h: 0,
            shelf_w: 0,
            shelf_color: { r: 0, g: 0, b: 0, a: 1 },
            shelf_id: -1,
            product_x: 0,
            product_y: 0,
            product_w: 0,
            product_h: 0,

            // Planogram
            space_y: 480,

            shelf_active: true,
            loading: false,
            loadingSearch: false,
            requesting: false,
            searchTimeout: null,
            productBeingStored: {},

            menu: false,
            menu_x: 0,
            menu_y: 0,
            menuShelfShow: false,
            menuText: 'No se encontraron estantes.',
            isFormValid: false,
            rules: {
                required: (value) => !!value || "Campo obligatorio.",
                min: (v) => (v != null ? v.length >= 5 || "Mínimo 5 caracteres." : false),
                shelfMin: (val) => {
                    return val >= 10 || `El porcentaje mínimo es de 10%.`;
                    // return val >= 10;
                    // console.log(val);
                    // return true;
                    // val = 12;
                    // val >= Math.trunc(window.innerHeight * 0.75 * 0.1) ||
                    // `Porcentaje mínimo 10%.`,
                },
                shelfMax: (val) => {
                    return val <= 100 || `El porcentaje máximo es de 100%.`;

                    // +val <= Math.trunc(window.innerHeight * 0.75 * 0.15) * 2 ||
                    // `La altura máxima es ${
                    //   Math.trunc(window.innerHeight * 0.75 * 0.15) * 2
                    // }.`,
                },
            },
            products: [],
            shelves: [],
            searchMode: false,
            search: "",
            file: null,
            planogramSrc: "",
            dialogSearch: false,
            dialogGallery: false,
            dialogColor: false,
            dialogDelete: false,
            backgroundId: -1,
            backgroundData: {},
            editedId: -1,
            editedIndex: -1,
            editedItem: {
            nombre: "",
            titulo: "",
            colorTitulo: "",
            colorFondo: "",
            colorEncabezado: "",
            idEncabezado: -1,
            idFondo: -1,
            imagen: "",
            estantes: [],
            },
            defaultItem: {
            nombre: "",
            titulo: "",
            colorTitulo: "",
            colorFondo: "",
            colorEncabezado: "",
            idEncabezado: -1,
            idFondo: -1,
            imagen: "",
            estantes: [],
            },
            snackbar: false,
            snackbarText: "",
            snackbarColor: "black",

            calShelfMaxPor: 0,
            calShelfOriginY: 0,
            calShelfHeight: 0,

        }),

        watch: {},

        computed: {

            planogramHeight() {

                // let val = Math.trunc(window.innerHeight * 0.75);
                let val = 480;
                // console.log("[Computed] planogramHeight", val);
                return val;

            },

            planogramWidth() {

                // let val = Math.trunc((this.planogramHeight / 16) * 9);
                let val = 270;
                // console.log("[Computed] planogramWidth", val);
                return val;

            },

            baseShelfHeight() {

                let val = Math.trunc((this.planogramHeight / 100) * 0.8);
                // console.log("[Computed] baseShelfHeight", val);
                return val;

            },

            minShelfHeight() {

                // let val = Math.trunc(window.innerHeight * 0.75 * 0.1);
                // console.log("[Computed] minShelfHeight", val);
                return 10;

            },

            maxShelfHeight() {

                let val = Math.trunc(window.innerHeight * 0.75 * 0.15) * 2;
                // console.log("[Computed] maxShelfHeight", val);
                return val;
            },

        },

        methods: {

            forceRerender() {

                this.componentKey += 10;

            },

            updatedProduct( index, pos, args ) {

                let obj = [ this.shelves[index].storedProducts[pos].size.w, this.shelves[index].storedProducts[pos].size.h, this.shelves[index].storedProducts[pos].size.originX, this.shelves[index].storedProducts[pos].size.originY ]

                // console.log( 'updated Product', index, pos, args, obj );

            },

            beforeUpdateProduct( index, pos, args ) {

                let obj = [ this.shelves[index].storedProducts[pos].size.w, this.shelves[index].storedProducts[pos].size.h, this.shelves[index].storedProducts[pos].size.originX, this.shelves[index].storedProducts[pos].size.originY ]

                // console.log( 'beforeUpdate Product', index, pos, args, obj );

            },

            async deletePlanogram() {

                let endpoint = `Gondolas/${this.editedId}`;
                this.loading = true;
                await this.$http.delete(endpoint)
                    .then((res) => {

                        this.$store.commit('addNotification', {
                            type: 'success',
                            title: this.editedItem.nombre,
                            content: 'Planograma eliminado exitosamente',
                        });

                        this.$router.replace({ name: 'PlanogramList' });

                    }).catch((err) => {

                        this.$store.commit('addNotification', {
                            type: 'error',
                            title: this.editedItem.nombre,
                            content: 'Ocurrió un error al eliminar el planograma',
                        });

                        console.log( 'error', err );
                        
                    });

                this.loading = false;

            },

            xy( type, left, top, vdrData, index, pos ) {

                // console.log( 'DRAGGING', left, top );

                if( type == 'Shelf' ) {

                    this.shelf_x = left;
                    this.shelf_y = top;

                }else if (type == 'Product' ) {

                    // let domElement = document.querySelector(`#_SP_VDR-${index}-${pos}`);
                    // let originY = Math.round( this.shelves[index].h - vdrData.size.h - 6 );
                    // domElement.style.transform = `translate( ${left}px ,${originY}px)`;

                    this.product_x = left;
                    this.product_y = top;

                }

            },

            setInitialOffsets(left, top, vdrData, type, index, pos) {

                if (isNaN(left)) left = 0;

                let shelf = this.shelves[index];

                // Calculate for shelves
                if( type == 'Shelf' ) {

                    console.log( type+' '+index+' SET INITIAL OFFSETS (l,t)', left, top );

                    let domElement = document.querySelector(`#vdr_shelf-${index}`);
                    domElement.style.transform = `translate(0px, ${shelf.originY}px)`;

                    let pHeight = (top * 100) / this.planogramHeight;

                    shelf.originY = top;
                    shelf.proportionalHeight = pHeight;

                }else if( type == 'Product' ) {

                    console.log( type+' '+index+'-'+pos+' SET INITIAL OFFSETS (l,t)', left, top );

                    let product = this.shelves[index].storedProducts[pos];

                    // if( product.created !== undefined ) {

                        // if( !product.created ) {

                            // console.log( 'SET INITIAL OFFSETS created' );
                            product.size.originY = top;

                            let pWidth = Math.round( ((vdrData.size.w * 100) / this.planogramWidth) * 10000000 );
                            let pHeight = Math.round( ((vdrData.size.h * 100) / shelf.h) * 10000000 );

                            let pOriginY = 0;
                            let pOriginX = Math.round( ((left * 100) / this.planogramWidth) * 10000000 );

                            product.proportionalSize = {

                                pWidth,
                                pHeight,
                                pOriginY,
                                pOriginX

                            }

                        //     product.created = true;

                        // }else {

                        //     console.log( 'SET INITIAL OFFSETS not repeat created' );

                        // }

                    // }

                }

            },

            dragStopOffsets(left, top, vdrData, type, index, pos) {

                let shelf = this.shelves[index];
                if( isNaN(left) ) left = 0;

                // if( typeof type === "string" ) {

                if( type === 'Shelf' ) {

                    console.log( type +' '+ index + ' DRAG STOP OFFSETS (l,t)', left, top );

                    let pHeight = (top * 100) / this.planogramHeight;

                    shelf.originY = top;
                    shelf.proportionalHeight = pHeight;

                    // setTimeout(() => {

                    //     for( let a = 0; a < this.shelves[index].storedProducts.length; a++ ) {

                    //         let domElement = document.querySelector(`#_SP_VDR-${index}-${a}`);

                    //         domElement.style.width = this.shelves[index].storedProducts[a].size.w+'px';
                    //         domElement.style.height = this.shelves[index].storedProducts[a].size.h+'px';
                    //         domElement.style.transform = 'transform: translate('+this.shelves[index].storedProducts[a].size.originX+'px, '+this.shelves[index].storedProducts[a].size.originY+'px)';

                    //     }

                    // }, 5);

                }else if ( type === 'Product' ) {

                    // let domElement = document.querySelector(`#_SP_VDR-${index}-${pos}`);
                    // let originY = Math.round( this.shelves[index].h - vdrData.size.h - 6 );
                    // domElement.style.transform = `translate( ${left}px ,${originY}px)`;

                    let product = this.shelves[index].storedProducts[pos];

                    let pWidth = Math.round( ((vdrData.size.w * 100) / this.planogramWidth) * 10000000 );
                    let pHeight = Math.round( ((vdrData.size.h * 100) / shelf.h) * 10000000 );

                    let pOriginY = 0;
                    let pOriginX = Math.round( ((left * 100) / this.planogramWidth) * 10000000 );

                    // product.size.originY = top;
                    product.size.originY = shelf.h - product.size.h - 6;
                    product.size.originX = left;

                    product.proportionalSize = {

                        pWidth,
                        pHeight,
                        pOriginY,
                        pOriginX

                    };

                    console.log( type +' '+ index +'-'+ pos + ' DRAG STOP OFFSETS (l,t)', product.proportionalSize );

                    // console.log(product);

                }

                // }

            },

            tweakOnResize( index, pos, data, x, y, width_elem, height_elem ) {

                console.log( "TWEAK ON RESIZE (w,h)", width_elem, height_elem);

                let width = Math.round( width_elem );
                let height = Math.round( height_elem );

                let shelf = this.shelves[index];

                let product = this.shelves[index].storedProducts[pos];

                let pWidth = Math.round(((width * 100) / this.planogramWidth) * 10000000);
                let pHeight = Math.round(((height * 100) / shelf.h) * 10000000);

                let pOriginY = 0;
                let pOriginX = Math.round(((x * 100) / this.planogramWidth) * 10000000);

                product.size.w = width;
                product.size.h = height;
                // product.size.originY = y;
                product.size.originX = x;
                product.size.originY = shelf.h - height - 6;

                product.proportionalSize = {

                    pWidth,
                    pHeight,
                    pOriginY,
                    pOriginX

                };

                console.log("RESIZE RESULT (w,h)", product.size.w, product.size.h);

            },

            async removeShelf( index ) {

                if( this.shelves[index].id > -1 ) {

                    let endpoint = `Estantes/${this.shelves[index].id}`;
                    this.loading = true;
                    await this.$http
                    .delete(endpoint)
                    .then((res) => {
                        this.$store.commit('addNotification', {
                            type: 'success',
                            title: this.editedItem.nombre,
                            content: 'Estante ' + (index + 1) + ' eliminado',
                        });
                        
                    })
                    .catch((err) => {
                        this.$store.commit('addNotification', {
                            type: 'error',
                            title: this.editedItem.nombre,
                            content: 'No se pudo eliminar el estante' + (index + 1),
                        });
                    });

                    this.loading = false;

                }


                console.log( '-------------------------------' );

                this.shelves.splice( index, 1 );

                let letProducts = [];

                for( let i = 0; i < this.shelves.length; i++ ) {

                    letProducts.push( this.cloneArray( this.shelves[i].storedProducts ) );
                    this.shelves[i].storedProducts = [];

                }

                setTimeout(() => {

                    for( let i = 0; i < letProducts.length; i++ ) {

                        this.shelves[i].storedProducts = this.cloneArray( letProducts[i] );

                    }

                    letProducts = [];

                }, 100);

            },

            handleProduct( obj ) {

                // console.log( 'handleProduct', obj );

                if( obj.archivos !== undefined &&
                    obj.archivos !== null &&
                    obj.archivos.length > 0 ) {

                    // console.dir( this.shelves.length > 0 );

                    if( this.shelves.length > 0 ) {

                        this.menuShelfShow = true;
                        this.showMenu( window.event, obj );

                    }else {

                        this.menuText = 'No se encontraron estantes.';
                        this.menuShelfShow = false;

                        this.menu = false;
                        this.menu_x = window.event.clientX;
                        this.menu_y = window.event.clientY;
                        this.productBeingStored = obj;
                        this.$nextTick(() => {
                            this.menu = true;
                        })

                    }

                }else {

                    this.menuText = 'Este producto no tiene ninguna imagen.';
                    this.menuShelfShow = false;

                    this.menu = false;
                    this.menu_x = window.event.clientX;
                    this.menu_y = window.event.clientY;
                    // this.productBeingStored = Object.assign({}, obj);
                    this.$nextTick(() => {
                        this.menu = true;
                    });

                }

            },

            getChildData(object) {
                console.log("Received data:", object);
                if (typeof object === "object") {
                    if (object.id && object.url) {
                    this.backgroundId = +object.id;
                    this.planogramSrc = object.url.toString();
                    }
                    this.dialogGallery = false;
                }
            },

            async save() {

                let contentNotification = '';

                this.loading = true;
                var planogram;
                if (this.editedId > -1) {
                    
                    contentNotification = 'Cambios guardados correctamente';

                    planogram = await this.$http
                    .put(
                        `Gondolas/${this.editedId}`,
                        Object.assign(
                        {},
                        {
                            nombre: this.editedItem.nombre,
                            titulo: this.editedItem.titulo,
                            idFondo: +this.backgroundId || +this.editedItem.idFondo,
                        }
                        )
                    )
                    .then((res) => {
                        if (res) {
                        // this.$store.commit( 'addNotification', {
                        //   type: 'success',
                        //   title: 'Editor Planograma '+this.editedId,
                        //   content: 'Planograma actualizado'
                        // })

                        return +res.data.idObjeto;
                        }
                    })
                    .catch((err) => {
                        console.log("error", err);

                        // this.$store.commit( 'addNotification', {
                        //   type: 'error',
                        //   title: 'Editor Planograma '+this.editedId,
                        //   content: 'Operación cancelada'
                        // })

                        return null;
                    });
                }else {

                    contentNotification = 'Planograma creado correctamente';

                    planogram = await this.$http
                    .post(
                        "Gondolas",
                        Object.assign(
                        {},
                        {
                            nombre: this.editedItem.nombre,
                            titulo: this.editedItem.titulo,
                            idFondo: +this.backgroundId,
                        }
                        )
                    )
                    .then((res) => {
                        console.log(res);
                        if (res) {
                        // this.$store.commit( 'addNotification', {
                        //   type: 'success',
                        //   title: 'Editor Planograma '+this.editedId,
                        //   content: 'Planograma creado'
                        // })

                        return +res.data.idObjeto;
                        }
                    })
                    .catch((err) => {
                        console.log("error", err);

                        // this.$store.commit( 'addNotification', {
                        //   type: 'error',
                        //   title: 'Editor Planograma '+this.editedId,
                        //   content: 'Operación cancelada'
                        // })

                        return null;
                    });
                }

                console.log('planogram id', planogram);
                if (this.editedId > -1) planogram = this.editedId;

                if (planogram) {
                    var i = 0;
                    let arr = this.shelves.length;

                    // Array of Objects
                    var ids = [];

                    for (i; i < arr; i++) {
                    var s = this.shelves[i];
                    let color = `rgba(${s.color.r}, ${s.color.g}, ${
                        s.color.b
                    }, ${parseInt(s.color.a).toFixed(2)})`;
                    let shelfData = Object.assign(
                        {},
                        {
                        color: color,
                        altura: Math.round(+s.proportionalHeight * 10000000),
                        orden: Math.round((+s.h / this.space_y) * 100 * 10000000),
                        idGondola: planogram,
                        }
                    );

                    console.log(shelfData);

                    // update shelf
                    if (this.shelves[i].id > -1) {
                        await this.$http
                        .put(`Estantes/${this.shelves[i].id}`, shelfData)
                        .then((response) => {
                            console.log(response);
                            if (response && response.data) {
                            const obj = { id: +this.shelves[i].id, index: i };
                            console.log("shelf obj then", obj);
                            ids.push(obj);

                            // this.$store.commit( 'addNotification', {
                            //   type: 'success',
                            //   title: 'Editor Planograma '+this.editedId,
                            //   content: 'Estante actualizado'
                            // })
                            }
                        })
                        .catch((err) => {
                            console.log("error", err);
                            this.loading = false;
                        });
                    } else {
                        // post shelf
                        await this.$http
                        .post("Estantes", shelfData)
                        .then((response) => {
                            console.log(response);
                            if (response && response.data) {
                            const obj = { id: +response.data.idObjeto, index: i };
                            console.log("shelf obj then", obj);
                            ids.push(obj);

                            // this.$store.commit( 'addNotification', {
                            //   type: 'success',
                            //   title: 'Editor Planograma '+this.editedId,
                            //   content: 'Estante insertado'
                            // })
                            }
                        })
                        .catch((err) => {
                            console.log("error", err);
                            this.loading = false;
                        });
                    }
                    }

                    if (ids.length) {
                    // each shelf id

                    for (let _id of ids) {
                        var payloadProducts = [];

                        let products = this.shelves[_id.index].storedProducts;
                        if (products.length) {
                        for (let a = 0; a < products.length; a++) {
                            let p = products[a];

                            // let data = Object.assign(
                            //   {},
                            //   {
                            //     idEstante: +_id.id,
                            //     idArticulo: p.id,
                            //     nombre: "",
                            //     origenX: p.proportionalSize.pWidth,
                            //     origenY: p.proportionalSize.pHeight,
                            //     cantidadX: 1,
                            //     cantidadY: 1,
                            //     alto: Math.round((p.size.h / this.planogramHeight) * 1000),
                            //     ancho: Math.round((p.size.w / this.planogramWidth) * 1000),
                            //   }
                            // );

                            let data = {
                            idEstante: +_id.id,
                            idArticulo: p.id,
                            nombre: "",
                            origenX: p.proportionalSize.pOriginX,
                            origenY: p.proportionalSize.pOriginY,
                            cantidadX: 1,
                            cantidadY: 1,
                            alto: p.proportionalSize.pHeight,
                            ancho: p.proportionalSize.pWidth,
                            };

                            // console.log( data );

                            payloadProducts.push(data);
                        }

                        // send shelf products to api
                        if (this.editedId > -1) {
                            await this.$http.put(`Estantes/${_id.id}/Articulos`, {
                            articulos: payloadProducts,
                            });
                        } else {
                            await this.$http.post(`Estantes/${_id.id}/Articulos`, {
                            articulos: payloadProducts,
                            });
                        }
                        }
                    } // end for ids
                    }
                }
                this.loading = false;

                this.$router.replace({ name: 'PlanogramList' });

                this.$store.commit('addNotification', {
                    type: 'success',
                    title: this.editedItem.nombre,
                    content: contentNotification,
                });

            },

            sendToShelf( pos ) {

                // if( this.productBeingStored.archivos !== undefined &&
                //     this.productBeingStored.archivos !== null &&
                //     this.productBeingStored.archivos.length > 0 ) {

                const image = new Image();
                image.src = this.productBeingStored.archivos[0].url;
                image.onload = () => {
                    return image.src;
                };

                let product_w = 10;
                let product_h = 10;
                let product_w_proportion = 0;
                let product_h_proportion = 0;
                let originY = 0;
                let originX = 0;

                if( image.height > image.width ) {

                    product_h = Math.round( this.planogramHeight * 0.09 );
                    // if( product_h%2 == 1 ) product_h--;

                    product_h_proportion = ((image.height - product_h) * 100) / image.height;

                    product_w = Math.round( image.width - image.width * (product_h_proportion / 100) );
                    // if( product_w%2 == 1 ) product_w--;

                }else {

                    product_w = Math.round( this.planogramHeight * 0.09 );
                    // if( product_w%2 == 1 ) product_w--;

                    product_w_proportion = ((image.width - product_w) * 100) / image.width;
                    product_h = image.height - image.height * (product_w_proportion / 100);

                }

                originY = this.shelves[pos].h - product_h - 6;

                this.productBeingStored.size = {

                    w: product_w,
                    h: product_h,
                    originY,
                    originX

                };

                // console.log(this.productBeingStored);

                this.shelves[pos].storedProducts.push(this.productBeingStored);
                // console.log( 'shelves', this.shelves );

                this.$nextTick(() => {
                    this.menu = false;
                });

            },

            showMenu( e, obj ) {

                this.menu = false;
                this.menu_x = e.clientX;
                this.menu_y = e.clientY;
                this.productBeingStored = Object.assign({}, obj);
                this.$nextTick(() => {
                    this.menu = true;
                });

            },

            rgba(object) {

                if (typeof object === "object") {
                    const c = object;
                    return `rgba(${c.r},${c.g},${c.b},${Number(c.a).toFixed(2)})`;
                }
                return `rgba(0,0,0,1.00)`;

            },

            cloneArray(obj) {

                if (obj === null || typeof obj !== "object") return obj;

                let temp = obj.constructor();
                for (var key in obj) temp[key] = this.cloneArray(obj[key]);

                return temp;

            },

            calculateShelfSpace() {
                
                let maxPor = 100;
                let minPor = 10;
                let originY = 0;
                let get_height = this.space_y * (this.shelf_h / 100);
                // let shelves_ordered = {};
                // let insert = false;

                console.log("CALCULATE SHELF SPACE: ", get_height);

                let shelves_ordered = this.cloneArray(this.shelves);
                shelves_ordered = this.cloneArray(
                    shelves_ordered.sort(({ originY: a }, { originY: b }) => a - b)
                );

                let insert = shelves_ordered.some((shelve, index, array) => {
                    console.log(this.planogramHeight, shelve.h, shelve.originY);

                    if (array.length == 1) {
                    if (shelve.originY >= get_height) {
                        originY = 0;
                        return true;
                    } else if (
                        get_height <=
                        this.planogramHeight - (shelve.originY + shelve.h)
                    ) {
                        originY = Math.round(shelve.originY + shelve.h);
                        return true;
                    }
                    } else if (index == 0) {
                    if (shelve.originY >= get_height) {
                        originY = 0;
                        return true;
                    }
                    } else if (array[index - 1] !== undefined) {
                    if (
                        shelve.originY - (array[index - 1].originY + array[index - 1].h) >=
                        get_height
                    ) {
                        originY = Math.round(array[index - 1].originY + array[index - 1].h);
                        return true;
                    } else if (array.length == index + 1) {
                        if (
                        this.planogramHeight - (array[index].originY + array[index].h) >=
                        get_height
                        ) {
                        originY = Math.round(shelve.originY + shelve.h);
                        return true;
                        }
                    }
                    }
                });

                if (this.shelves.length == 0) insert = true;

                // console.log("insert:", insert);

                this.calShelfHeight = get_height;
                this.calShelfMaxPor = maxPor;
                this.calShelfOriginY = originY;

                return insert;
                
            },

            addShelf(items) {
                // console.log( this.shelf_h, this.minShelfHeight );
                // console.log( this.space_y, this.minShelfHeight );

                if( this.shelf_h >= this.minShelfHeight ) {
                    // console.log( this.shelves );
                    // if (this.space_y > this.minShelfHeight) {
                    // this.space_y = this.space_y - this.shelf_h;

                    if( this.calculateShelfSpace() ) {

                        let obj = {
                            color: this.shelf_color,
                            h: this.calShelfHeight,
                            originY: this.calShelfOriginY,
                            id: this.shelf_id,
                            // storedProducts: this.editedId > -1 && items.length ? items : [],
                            storedProducts: []
                        };

                        this.shelves.push( obj );

                        console.log("INSERTEDING SHELF");

                    }else {
                        this.snackbar = true;
                        this.snackbarColor = "danger";
                        this.snackbarText = "No hay espacio disponible.";
                    }

                }else {

                    this.snackbar = true;
                    this.snackbarColor = "danger";
                    this.snackbarText = `El mínimo de altura del estante debe ser de ${this.minShelfHeight}px`;

                }

            },

            async initialize() {

                this.loading = true;
                this.products = [];
                this.editedId = -1;
                this.editedIndex = -1;
                this.shelf_id = -1;
                this.shelf_h = this.minShelfHeight;

                console.log("route params", this.$route.params);

                if( this.$route.params ) {

                    this.editedId = +this.$route.params.id || -1;
                    this.editedIndex = +this.$route.params.id || -1;

                    if( typeof this.editedId == "number" && this.editedId > -1 ) {

                        let planogramEndpoint = `Gondolas/${this.editedId}`;
                        // Get planogram nested data
                        await this.$http
                            .get(planogramEndpoint)
                            .then((res) => {
                            if (res && res.data) {
                                Object.assign(this.editedItem, res.data);

                                // this.$store.commit( 'addNotification', {
                                //   type: 'success',
                                //   title: 'Editor Planograma '+this.editedItem.idFondo,
                                //   content: 'Datos del planograma obtenidos correctamente'
                                // })
                            }
                            })
                            .catch((err) => {
                            console.log("error", err);

                            this.loading = false;
                            this.$route.replace({ name: "PlanogramList" });

                            // this.$store.commit( 'addNotification', {
                            //   type: 'error',
                            //   title: 'Editor Planograma '+this.editedItem.idFondo,
                            //   content: 'No se pudieron obtener datos del planograma'
                            // })
                            });
                        // Load background
                        await this.$http
                            .get(`Archivos/${this.editedItem.idFondo}`)
                            .then((res) => {
                            if (res && res.data) {
                                this.getChildData(Object.assign({}, res.data));
                            }
                            })
                            .catch((err) => {
                            console.log("error", err);

                            // this.$store.commit( 'addNotification', {
                            //   type: 'error',
                            //   title: 'Editor Planograma '+this.editedItem.idFondo,
                            //   content: 'No se pudo obtener el fondo del planograma'
                            // })
                            });

                        console.log(this.editedItem.estantes.length);

                        if( this.editedItem.estantes.length > 0 ) {

                            for( let s of this.editedItem.estantes ) {

                                // console.log("altura", s.altura);

                                // handle color
                                let color = s.color;

                                if (color.indexOf("rgba(") === 0) {

                                    let pars = color.indexOf(","),
                                    repars = color.indexOf(",", pars + 1);
                                    var rgba = {
                                    r: parseInt(color.substr(5, pars)),
                                    g: parseInt(color.substr(pars + 1, repars)),
                                    b: parseInt(
                                        color.substr(
                                        color.indexOf(",", pars + 1) + 1,
                                        color.indexOf(",", repars)
                                        )
                                    ),
                                    a: parseFloat(
                                        color.substr(
                                        color.indexOf(",", repars + 1) + 1,
                                        color.indexOf(")")
                                        )
                                    ),
                                    };
                                    
                                }

                                this.shelf_color = rgba;
                                // this.shelf_h = s.orden;
                                // this.shelf_h = this.shelf_pHeight/10000000;
                                this.shelf_pHeight = s.altura;
                                // this.shelf_pHeight = 150;
                                this.shelf_id = s.id;

                                var productsToStore = [];

                                console.log(this.shelf_pHeight, this.shelf_h);
                                console.log(
                                    this.planogramHeight * (this.shelf_pHeight / 10000000 / 100)
                                );
                                //  let miH = this.space_y * (this.shelf_h/100);
                                // console.log( miH );
                                s.storedProducts = [];
                                let obj = {
                                    id: this.shelf_id,
                                    h: this.space_y * (s.orden / 100 / 10000000),
                                    color: this.shelf_color,
                                    originY: this.planogramHeight * (this.shelf_pHeight / 10000000 / 100),
                                    storedProducts: [],
                                };
                                // Change
                                // if (this.editedId > -1) this.shelves.push(obj);
                                // else this.shelves.push(obj);
                                this.shelves.push(obj);

                                // this.addShelf(productsToStore);

                            }

                            // console.log(this.editedItem);
                            // console.log("MI SHELVESSSS", this.shelves);

                            let countShelf = 0;
                            for( let s of this.editedItem.estantes ) {

                                let myProductsArray = [];

                                // console.log(s);
                                // console.log(this.shelves[countShelf]);

                                for (let pr = 0; pr < s.articulos.length; pr++) {

                                    // console.log("PRODUCTO A PUNTO DE ROMPERSE:", s.articulos[pr]);

                                    let endpoint = `Articulos/${s.articulos[pr].idArticulo}`;
                                    this.loading = true;
                                    await this.$http
                                    .get(endpoint)
                                    .then((res) => {

                                        if (res && res.data) {

                                        // this.productBeingStored = Object.assign({}, res.data);
                                        this.productBeingStored = res.data;
                                        // let productLet = res.data;

                                        // console.log(this.productBeingStored);

                                        const image = new Image();
                                        image.src = this.productBeingStored.archivos[0].url;
                                        image.onload = () => {
                                            return image.src;
                                        };

                                        let product_w = 10;
                                        let product_h = 10;
                                        let product_w_proportion = 0;
                                        let product_h_proportion = 0;
                                        let originY = 0;
                                        let originX = 0;
                                        // let originX = 0;

                                        // console.log(s.articulos[pr]);

                                        product_h = Math.round( this.shelves[countShelf].h * (s.articulos[pr].alto / 10000000 / 100) );
                                        product_w = Math.round( this.planogramWidth * (s.articulos[pr].ancho / 10000000 / 100) );

                                        originY = Math.round( this.shelves[countShelf].h - product_h - 6 );
                                        originX = Math.round( this.planogramWidth * (s.articulos[pr].origenX / 10000000 / 100) );

                                        this.productBeingStored.size = {

                                            w: product_w,
                                            h: product_h,
                                            originY,
                                            originX

                                        };

                                        // console.lo

                                        // console.log( this.productBeingStored.size );

                                        myProductsArray.push( this.productBeingStored );

                                        }else console.log("ACA NO ESTUVO OKEY :(");

                                        this.loading = false;
                                    })
                                    .catch((err) => {
                                        console.log("error", err);
                                        this.loading = false;
                                    });

                                }

                                // this.shelves[countShelf].storedProducts.push( productLet );
                                this.shelves[countShelf].storedProducts = myProductsArray;

                                countShelf++;

                            }

                            this.shelf_id = -1;

                        }

                    }

                }

                this.loading = false;

            },

        },

        mounted: function () {

            this.initialize();

        },

    };

</script>


<style>

    .planogram__background {
        position: absolute;
        z-index: 100 !important;
        top: 0;
        left: 0;
        max-width: 100%;
        height: 100%;
    }

    .shelf_img {
        max-width: 100%;
        height: 100%;
        width: 100%;
    }

    .__background-small {
        position: relative;
        max-height: 20vh;
        max-width: 20vh;
        min-height: 20vh;
        min-width: 20vh;
    }

    .my-class {
        background-color: green;
        border: 1px solid red;
        -webkit-transition: background-color 200ms linear;
        -ms-transition: background-color 200ms linear;
        transition: background-color 200ms linear;
    }

    .shelf__dragging {
        cursor: move;
    }
    /* Fixes class dragging*/
    .shelf__dragging:hover {
        cursor: move;
    }

    .my-dragging-class {
        background-color: red;
        border: 1px solid black;
    }

    .my-resizing-class {
        background-color: blue;
        border: 1px solid black;
        color: white;
    }

    .my-active-class {
        border: 1px solid black;
        -webkit-box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
        box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
    }

    .my-handle-class {
        position: absolute;
        background-color: pink;
        border: 1px solid black;
        border-radius: 50%;
        height: 14px;
        width: 14px;
        box-model: border-box;
        -webkit-transition: all 300ms linear;
        -ms-transition: all 300ms linear;
        transition: all 300ms linear;
    }

    .my-handle-class-tl {
        top: -14px;
        left: -14px;
        cursor: nw-resize;
    }

    .my-handle-class-tm {
        top: -14px;
        left: 50%;
        margin-left: -7px;
        cursor: n-resize;
    }

    .my-handle-class-tr {
        top: -14px;
        right: -14px;
        cursor: ne-resize;
    }

    .my-handle-class-ml {
        top: 50%;
        margin-top: -7px;
        left: -14px;
        cursor: w-resize;
    }

    .my-handle-class-mr {
        top: 50%;
        margin-top: -7px;
        right: -14px;
        cursor: e-resize;
    }

    .my-handle-class-bl {
        bottom: -14px;
        left: -14px;
        cursor: sw-resize;
    }

    .my-handle-class-bm {
        bottom: -14px;
        left: 50%;
        margin-left: -7px;
        cursor: s-resize;
    }

    .my-handle-class-br {
        bottom: -14px;
        right: -14px;
        cursor: se-resize;
    }

    .my-handle-class-tl:hover,
    .my-handle-class-tr:hover,
    .my-handle-class-bl:hover,
    .my-handle-class-br:hover {
        background-color: red;
        transform: scale(1.4);
    }

    .shelf-actions-left {
        position: absolute;
        bottom: 0;
        right: 101%;
        border: 1px solid yellow;
        width: 30px;
    }

    .shelf-actions-right {
        position: absolute;
        bottom: 0;
        left: 101%;
        border: 1px solid yellow;
        width: 30px;
    }

    .class-planogram-propia {
        border: none;
        background: rgba(51, 51, 51, 0.25);
    }

    /* Mis propias clases */
    .planogram-editor {
        padding: 0;
    /* position: relative; */
    }

    .main-title {
        padding: 0;
        text-align: center;
        font-size: 18px;
        font-weight: 400;
        padding: 4px 0;
    }

    .main-management {
        padding: 12px 16px 12px 16px;
    }

    .main-products {
        padding: 0;
        max-height: 480px;
        padding-right: 40px;
    }

    .main-products-col {
        padding: 0;
        max-height: 480px;
    }

    .main-planogram {
        padding: 0;
        max-width: 270px;
        height: 480px;
    }

    .main-settings {
        padding: 0;
        padding-left: 44px;
    }

    .main-menu {
        z-index: 1000;
    }

    .menu-alert {
        margin: 0;
    }

    /* Mis propias clases */
</style>