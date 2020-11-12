<template>
  <div class="products-add-one">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-sheet color="secondary">
            <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
          </v-sheet>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-sheet color="secondary" class="text-h6 text-left pa-5">
            Agregar un producto
          </v-sheet>
        </v-col>
      </v-row>
      <v-sheet class="pa-5">
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <div class="d-flex justify-center justify-sm-start">
              <v-switch v-model="productEnabled" label="¿Habilitar?"></v-switch>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="productName"
              label="Nombre"
              counter="50"
              maxlength="50"
              outlined
              clearable
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="productSku"
              label="SKU"
              counter="50"
              maxlength="50"
              outlined
              clearable
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="productPrice"
              label="Precio"
              prefix="$"
              value="0.00"
              outlined
              clearable
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="4">
            <v-autocomplete
              v-model="productType"
              label="Tipo"
              maxlength="50"
              clearable
              outlined
              small-chips
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="4">
            <v-autocomplete
              v-model="productManufacturer"
              label="Fabricante"
              maxlength="50"
              clearable
              outlined
              small-chips
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="4">
            <v-autocomplete
              v-model="productCategory"
              label="Categoría"
              maxlength="50"
              clearable
              multiple
              outlined
              small-chips
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="productSubtitle"
              label="Subtítulo"
              counter="50"
              maxlength="50"
              outlined
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="productTags"
              label="Etiquetas"
              outlined
              clearable
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-textarea
              v-model="productDescriptionLg"
              label="Descripción"
              rows="5"
              outlined
              clearable
            ></v-textarea>
          </v-col>
          <v-col cols="12" sm="6">
            <v-textarea
              v-model="productProspect"
              label="Prospecto"
              rows="5"
              outlined
              clearable
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <div class="float-none float-sm-right d-flex justify-center">
              <v-btn type="submit" color="success" elevation="3" x-large>
                Agregar producto
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "ProductsAddOne",
  components: {},
  data: () => ({
    breadcrumbs: [
      { text: "Productos", disabled: false, href: "/productos" },
      { text: "Agregar nuevo producto", disabled: true }
    ],

    productName: "",
    productSku: "",
    productPrice: 0.0,
    productEnabled: true,
    productTags: "",
    productSubtitle: "",
    productDescriptionLg: "",
    productProspect: "",
    productCategorySelected: "",
    productCategory: -1,
    productManufacturer: -1,
    productType: -1
  })
};
</script>
