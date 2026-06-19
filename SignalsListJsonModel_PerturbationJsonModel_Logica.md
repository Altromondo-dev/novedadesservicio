# Logica de Modelos: SignalsListJsonModel y PerturbationJsonModel

## Resumen General

El sistema de senializacion usa **3 modelos JSON** que trabajan en conjunto para gestionar las seniales asociadas a una Novedad de Servicio:

| Modelo | Proposito |
|--------|-----------|
| **SignalsFormJsonModel** | Formulario de datos basicos de la senal (Posicion, Senializacion, Texto) |
| **PerturbationJsonModel** | Formulario de perturbaciones (checkboxes booleanos + ET/KM) |
| **SignalsListJsonModel** | Lista/tabla de seniales ya cargadas (resultado del merge de los dos anteriores) |

---

## 1. Estructura de cada Modelo

### SignalsFormJsonModel (Formulario basico)
```json
{
  "Senializacion": "",
  "Texto": "",
  "Posicion": "1"
}
```
- **Posicion**: Codigo de Relacion (string numerico). Se autocalcula como ultimo Posicion + 1.
- **Senializacion**: Descripcion/valor de la senal.
- **Texto**: Campo de texto/notas.

### PerturbationJsonModel (Formulario de perturbaciones)
```json
{
  "Perturbacion": [{
    "Rrpi": false,
    "Bz": false,
    "Pito": false,
    "Pit1": false,
    "Pili": false,
    "Plus": false,
    "Less": false,
    "Et": "",
    "Km": "",
    "Fn": false,
    "Fr": false,
    "Fs": false,
    "Ft": false,
    "Tx": false,
    "Rx": false,
    "T2": false,
    "Ts2": false,
    "Li": false,
    "Rr": false,
    "Et2": "",
    "Km2": "",
    "Fn2": false,
    "Fr2": false,
    "Fs2": false,
    "Ft2": false,
    "Tx2": false,
    "Rx2": false,
    "T22": false,
    "Ts22": false,
    "Li2": false,
    "Rr2": false
  }]
}
```

**Estructura dual**: Tiene dos conjuntos de campos identicos (base y secundario con sufijo "2"):
- **Indicadores booleanos**: Rrpi, Bz, Pito, Pit1, Pili, Plus, Less, Fn, Fr, Fs, Ft, Tx, Rx, T2, Ts2, Li, Rr
- **Campos de ubicacion**: Et (Estacion), Km (Kilometro)
- **Set secundario**: Et2, Km2, Fn2, Fr2, Fs2, Ft2, Tx2, Rx2, T22, Ts22, Li2, Rr2

**Binding en la vista**: Se accede al primer elemento del array: `{PerturbationJsonModel>/Perturbacion/0/NombreCampo}`

### SignalsListJsonModel (Lista de seniales)
```json
{
  "Signals": []
}
```
Array que contiene objetos resultado del merge de SignalsFormJsonModel + PerturbationJsonModel. Cada objeto tiene TODOS los campos de ambos modelos combinados.

---

## 2. Ciclo de Vida Completo

### Paso 1: Inicializacion
**Archivo**: `App.controller.js` (funcion `setApplicationModels`)

Los 3 modelos se inicializan cargando sus templates JSON vacios:
```javascript
AppManagementHelper.getModel("SignalsListJsonModel").loadData(sPath + "model/SignalsListJsonModel.json", "", false);
AppManagementHelper.getModel("PerturbationJsonModel").loadData(sPath + "model/PerturbationJsonModel.json", "", false);
AppManagementHelper.getModel("SignalsFormJsonModel").loadData(sPath + "model/SignalsFormJsonModel.json", "", false);
```

**Nota**: Los modelos se crean dinamicamente en `AppManagementHelper.getModel()`. Si el modelo no existe, se instancia un nuevo `sap.ui.model.json.JSONModel()` y se registra.

### Paso 2: Carga de datos existentes (al seleccionar una Novedad)
**Archivo**: `Main.controller.js` (linea ~5938)

Cuando el usuario selecciona una Novedad existente, las seniales vienen como navigation property del OData:
```javascript
AppManagementHelper.getModel("SignalsListJsonModel").setData({
    Signals: oSelectedNovedad.SenialXNS_nav.results
});
```

**Variante desde dialogo** (`NovedadDialogHelper.js`, linea ~306):
```javascript
AppManagementHelper.getModel("SignalsListJsonModel").setData({
    Signals: oSelectedNovedad.SenialXNS_nav  // sin .results (estructura diferente)
});
```

**Nota**: La navigation property `SenialXNS_nav` se expande en la consulta OData via `_expandProperties` en `AppManagementHelper.js`.

### Paso 3: Display en tabla
**Archivo**: `Main.view.xml`

La tabla se bindea a: `items="{SignalsListJsonModel>/Signals}"`

Cada columna muestra los campos del objeto merged (Posicion, Et, Km, los booleanos formateados como SI/NO, etc.)

### Paso 4: Agregar nueva senal (MERGE)
**Archivo**: `Main.controller.js`, funcion `senializacionAddPress` (linea 1180)

Este es el FLUJO CLAVE donde se combinan los modelos:

```javascript
senializacionAddPress: function () {
    var oUtilsJsonModel = AppManagementHelper.getModel("UtilsJsonModel");
    var bEdition = oUtilsJsonModel.getProperty("/editableMode");

    // 1. Obtener datos del formulario basico
    var oModel = AppManagementHelper.getModel("SignalsFormJsonModel");
    var oSignal = $.extend({}, oModel.getData());
    // oSignal = { Posicion: "1", Senializacion: "...", Texto: "..." }

    // 2. Obtener datos de perturbacion
    var oModelPerturbacion = AppManagementHelper.getModel("PerturbationJsonModel");
    var aPerturbacion = $.extend([], oModelPerturbacion.getData().Perturbacion);
    var oPerturbacion = aPerturbacion.shift();  // Toma el primer (unico) elemento

    // 3. MERGE: Combinar perturbacion con senal
    $.extend(oPerturbacion, oSignal);  // Copia props de oSignal sobre oPerturbacion
    var oMergedSignal = $.extend({}, oPerturbacion, oSignal);  // Objeto final merged

    // 4. Validacion: debe tener Posicion (Codigo de Relacion)
    if (!oMergedSignal.Posicion) {
        MessageBoxHelper.showAlert("Alerta", "Se debe cargar el Codigo de Relacion");
        return;
    }

    // 5A. Modo CREACION: agregar a la lista local
    if (!bEdition) {
        var oSignalListModel = AppManagementHelper.getModel("SignalsListJsonModel");
        var oSignalData = oSignalListModel.getData().Signals;
        if (this.addSignal) {  // flag que indica si es nueva senal
            oSignalData.push(oMergedSignal);
        }
        oSignalListModel.refresh(true);
    }
    // 5B. Modo EDICION: POST individual directo al backend
    else {
        SignalsService.IndividualPOSTEdition(oMergedSignal);
    }

    // 6. Limpiar formulario de perturbacion
    AppManagementHelper.getModel("PerturbationJsonModel").loadData(
        sPath + "models/PerturbationJsonModel.json", "", false
    );
    this.addSignal = true;
}
```

**Logica del merge detallada**:
1. `$.extend({}, oModel.getData())` - Copia shallow del formulario basico
2. `$.extend([], getData().Perturbacion)` - Copia shallow del array de perturbaciones
3. `aPerturbacion.shift()` - Extrae el primer (y unico) objeto del array
4. `$.extend(oPerturbacion, oSignal)` - Sobrescribe/agrega las props de signal en perturbacion
5. `$.extend({}, oPerturbacion, oSignal)` - Crea objeto final combinando ambos

**Resultado del merge**: Un objeto con TODOS los campos:
```javascript
{
    // De SignalsFormJsonModel:
    Posicion: "1",
    Senializacion: "valor",
    Texto: "nota",
    // De PerturbationJsonModel:
    Rrpi: false,
    Bz: true,
    Pito: false,
    // ... todos los demas campos de perturbacion
    Et: "EZEIZA",
    Km: "42",
    Et2: "",
    Km2: "",
    // ... etc
}
```

### Paso 5: Editar senal existente
**Archivo**: `Main.controller.js`, funcion `editSignal` (linea 1673)

Flujo inverso al merge: descompone un objeto de la lista en los dos formularios:
```javascript
editSignal: function (evt) {
    var obj = evt.getSource().getBindingContext("SignalsListJsonModel").getObject();

    // Cargar datos basicos en el formulario
    AppManagementHelper.getModel("SignalsFormJsonModel").setData({
        Posicion: obj.Posicion,
        Senializacion: obj.Senializacion,
        Texto: obj.Texto
    });

    // Cargar el objeto completo como perturbacion
    AppManagementHelper.getModel("PerturbationJsonModel").setData({
        Perturbacion: [obj]  // Wrappea el objeto en array
    });

    this.addSignal = false;  // Flag: NO agregar nuevo, sino reemplazar
}
```

### Paso 6: Eliminar senal
**Archivo**: `Main.controller.js`

**Modo creacion** (local, sin persistir):
```javascript
deleteSignalsFromTable: function (oEvent) {
    var obj = oEvent.getSource().getParent()
        .getBindingContext("SignalsListJsonModel").getObject();
    var oSignalModel = AppManagementHelper.getModel("SignalsListJsonModel");

    if (!bEdition) {
        var aItems = oSignalModel.getData().Signals;
        var iIndex = aItems.indexOf(obj);
        aItems.splice(iIndex, 1);  // Elimina del array local
        oSignalModel.refresh(true);
    } else {
        // Modo edicion: DELETE al backend
        SignalsService.remove(obj).then(function (res) {
            MessageBoxHelper.showAlert("Alerta", "Se ha borrado la senializacion con exito.");
            RefreshService.refreshNovedad(res);
        });
    }
}
```

### Paso 7: Limpiar formulario (nueva senal)
**Archivo**: `Main.controller.js`, funcion `senializacionCleanPress` (linea 1489)

```javascript
senializacionCleanPress: function () {
    var signals = AppManagementHelper.getModel("SignalsListJsonModel").getData().Signals;
    var sPath = FioriHelper.getAppPath();

    // Reset ambos formularios a sus templates
    AppManagementHelper.getModel("SignalsFormJsonModel")
        .loadData(sPath + "model/SignalsFormJsonModel.json", "", false);
    AppManagementHelper.getModel("PerturbationJsonModel")
        .loadData(sPath + "model/PerturbationJsonModel.json", "", false);

    // Autocalcular siguiente Posicion
    AppManagementHelper.getModel("SignalsFormJsonModel").setProperty("/Posicion",
        (signals[signals.length - 1] ? parseInt(signals[signals.length - 1].Posicion) : 0) + 1 + "");

    this.addSignal = true;
}
```

---

## 3. Persistencia OData

### Entidad Backend
- **Entity Set**: `/SenializacionesSet`
- **Clave compuesta**: `Empresa`, `Posicion`, `Id`
- **Navigation Property**: `SenialXNS_nav` (desde la Novedad)

### POST Individual (modo edicion)
**Archivo**: `SignalsService.js`, funcion `IndividualPOSTEdition`

```javascript
IndividualPOSTEdition: function (oSignal) {
    // Agrega campos de contexto antes de enviar
    oSignal.Id = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/IdNovedad");
    oSignal.Empresa = AppManagementHelper.getModel("UtilsJsonModel").getProperty("/Empresa");

    // POST al backend
    oDataService.getModel("TransenerOperaciones").create("/SenializacionesSet", oSignal, {
        success: function (data) { /* limpia form, refresh */ },
        error: function (error) { /* muestra error */ }
    });
}
```

### POST Batch (modo creacion - todas las seniales juntas)
**Archivo**: `SignalsService.js`, funcion `POST`

```javascript
POST: function () {
    var aSignals = $.extend([], AppManagementHelper.getModel("SignalsListJsonModel").getData().Signals);
    if (aSignals.length > 0) {
        var aOperation = this.buildBatchArray(aSignals);
        BatchOperationsHelper.setOptions("POST", {
            service: "TransenerOperaciones",
            operations: aOperation,
            callback: $.proxy(this.successBatchSignals, this)
        });
        BatchOperationsHelper.POST();
    } else {
        this.cleanSignalsForm();
        PruebasService.POST();  // Continua cadena de guardado
    }
}
```

### buildBatchArray (preparacion para batch)
```javascript
buildBatchArray: function (aSignals) {
    var aOperation = [];
    for (var i = 0; i < aSignals.length; i++) {
        aSignals[i].Posicion = aSignals[i].Posicion.toString();
        aSignals[i].Id = AppManagementHelper.getModel("SelectedNovedadJsonModel")
            .getProperty("/novedadId");
        aSignals[i].Empresa = AppManagementHelper.getModel("UtilsJsonModel")
            .getProperty("/Empresa");
        aOperation.push({
            entity: "/SenializacionesSet",
            data: aSignals[i]
        });
    }
    return aOperation;
}
```

### DELETE Individual
```javascript
remove: function(signal) {
    var entity = "/SenializacionesSet(Empresa='" + signal.Empresa +
        "',Posicion='" + signal.Posicion + "',Id='" + signal.Id + "')";
    oDataService.getModel("TransenerOperaciones").remove(entity, { ... });
}
```

### Limpieza post-guardado
```javascript
cleanSignalsForm: function () {
    // Reset los 3 modelos a sus templates vacios
    AppManagementHelper.getModel("SignalsFormJsonModel")
        .loadData(sPath + "model/SignalsFormJsonModel.json", "", false);
    AppManagementHelper.getModel("PerturbationJsonModel")
        .loadData(sPath + "model/PerturbationJsonModel.json", "", false);
    AppManagementHelper.getModel("SignalsListJsonModel")
        .loadData(sPath + "model/SignalsListJsonModel.json", "", false);
}
```

---

## 4. Diagrama de Flujo

```
INICIALIZACION
    |
    v
[Template JSON vacio] --> SignalsListJsonModel { Signals: [] }
[Template JSON vacio] --> PerturbationJsonModel { Perturbacion: [{ campos... }] }
[Template JSON vacio] --> SignalsFormJsonModel { Posicion, Senializacion, Texto }
    |
    v
CARGA DE NOVEDAD EXISTENTE
    |
    v
OData Read (con expand SenialXNS_nav)
    |
    v
SignalsListJsonModel.setData({ Signals: SenialXNS_nav.results })
    |
    v
DISPLAY EN TABLA (binding: SignalsListJsonModel>/Signals)
    |
    |--- [Usuario llena formularios] ---+
    |                                    |
    |                          SignalsFormJsonModel (Posicion, Senializacion, Texto)
    |                          PerturbationJsonModel (checkboxes, Et, Km)
    |                                    |
    |                                    v
    |                         BOTON "Agregar" (senializacionAddPress)
    |                                    |
    |                                    v
    |                         MERGE: $.extend({}, perturbacion, signal)
    |                                    |
    |                         +----------+-----------+
    |                         |                      |
    |                    Modo Creacion           Modo Edicion
    |                         |                      |
    |                    push a Signals[]     IndividualPOSTEdition
    |                    (local)              (POST /SenializacionesSet)
    |                         |                      |
    |                         v                      v
    |                    refresh tabla          refresh novedad
    |
    |--- [Usuario clickea Editar] ---+
    |                                 |
    |                    editSignal: descompone objeto
    |                    en SignalsFormJsonModel + PerturbationJsonModel
    |                    addSignal = false
    |
    |--- [Usuario clickea Eliminar] ---+
    |                                   |
    |                    +------+-------+
    |                    |              |
    |               Modo Creacion  Modo Edicion
    |                    |              |
    |               splice del     DELETE OData
    |               array local    /SenializacionesSet(keys)
    |
    v
GUARDADO FINAL (POST batch)
    |
    v
buildBatchArray: agrega Id y Empresa a cada senal
    |
    v
BatchOperationsHelper.POST -> /SenializacionesSet (batch)
    |
    v
cleanSignalsForm: reset 3 modelos a templates vacios
```

---

## 5. Consideraciones para Replicar en Otra Aplicacion

### Modelos necesarios
1. **FormModel** (datos basicos del item): campos de texto/identificadores
2. **PerturbationModel** (datos de perturbacion): array de 1 objeto con checkboxes y campos de ubicacion
3. **ListModel** (lista de items): array vacio que se llena con objetos merged

### Patron de merge
```javascript
// Clonar datos de ambos formularios
var formData = $.extend({}, formModel.getData());
var pertData = $.extend([], perturbationModel.getData().Perturbacion);
var pertObj = pertData.shift();

// Merge: perturbacion + form -> objeto combinado
$.extend(pertObj, formData);
var merged = $.extend({}, pertObj, formData);

// Agregar a la lista
listModel.getData().Items.push(merged);
listModel.refresh(true);
```

### Patron de edicion (descomposicion)
```javascript
// Desde el objeto de la lista, separar en los dos formularios
formModel.setData({
    campo1: obj.campo1,
    campo2: obj.campo2
});
perturbationModel.setData({
    Perturbacion: [obj]  // El objeto completo como perturbacion
});
```

### Patron de persistencia
- **Modo creacion**: Acumular en lista local, enviar todo junto via batch POST
- **Modo edicion**: POST individual inmediato al backend
- **Delete**: splice local en creacion, DELETE OData en edicion
- **Campos de contexto** (Id, Empresa): Se agregan al momento del POST, no se almacenan en el modelo local

### Entidad OData
- Entity Set: `/SenializacionesSet`
- Clave: `Empresa` + `Posicion` + `Id`
- Navigation: `SenialXNS_nav` desde la entidad padre (Novedad)

### Flag addSignal
- `true`: al hacer merge, se pushea el objeto al array (nueva senal)
- `false`: al hacer merge, se reemplaza en su lugar (edicion de senal existente)
- Se setea en `false` al editar, se vuelve a `true` al limpiar o despues de agregar
