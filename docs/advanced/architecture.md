# Architecture

This page describes mystore with C4-style views. The system is small, so the diagrams focus on the runtime boundaries that matter: the mobile user interface, the Bare worklet backend, RPC communication, and local product storage.

## C4 Context

```mermaid
C4Context
    title System Context for mystore

    Person(user, "Store operator", "Creates, reviews, updates, and deletes products from a mobile device")
    System(mystore, "mystore", "Mobile product catalog for managing product inventory")
    System_Ext(device_storage, "App-owned device storage", "Writable mobile app storage used by the Bare backend")

    Rel(user, mystore, "Uses")
    Rel(mystore, device_storage, "Stores product data in")
```

## C4 Container

```mermaid
C4Container
    title Container Diagram for mystore

    Person(user, "Store operator", "Uses the product catalog")

    System_Boundary(mystore, "mystore mobile app") {
        Container(app, "Expo React Native app", "React Native, Expo Router, NativeWind", "Renders the catalog UI and starts the Bare worklet")
        Container(rpc, "RPC channel", "bare-rpc over BareKit IPC", "Carries product commands and responses between the app and backend")
        Container(backend, "Bare worklet backend", "Bare, TypeScript", "Handles product commands and owns product persistence")
        ContainerDb(store, "Product store", "Corestore, Autobase, Hyperbee", "Stores and projects product records")
    }

    System_Ext(device_storage, "App-owned device storage", "Expo document storage path")

    Rel(user, app, "Creates, edits, and deletes products")
    Rel(app, rpc, "Sends product commands")
    Rel(rpc, backend, "Dispatches requests")
    Rel(backend, store, "Appends operations and reads projections")
    Rel(store, device_storage, "Persists under")
```

## C4 Component

```mermaid
C4Component
    title Component Diagram for the Bare Backend

    Container_Boundary(backend, "Bare worklet backend") {
        Component(dispatcher, "RPC dispatcher", "bare-rpc request handler", "Decodes commands and routes them to service handlers")
        Component(create_service, "Create product service", "TypeScript", "Creates normalized product records")
        Component(get_service, "Get product service", "TypeScript", "Reads a product by id or returns the first product")
        Component(list_service, "List products service", "TypeScript", "Reads the product list")
        Component(update_service, "Update product service", "TypeScript", "Applies product field changes")
        Component(delete_service, "Delete product service", "TypeScript", "Deletes products by id")
        Component(product_store, "Product store module", "Autobase, Hyperbee, Corestore", "Normalizes records, appends operations, and projects product views")
        Component(storage, "Storage resolver", "bare-os, bare-url", "Resolves the app-owned storage root passed from React Native")
    }

    Rel(dispatcher, create_service, "Routes CREATE_PRODUCT")
    Rel(dispatcher, get_service, "Routes GET_PRODUCT")
    Rel(dispatcher, list_service, "Routes LIST_PRODUCTS")
    Rel(dispatcher, update_service, "Routes UPDATE_PRODUCT")
    Rel(dispatcher, delete_service, "Routes DELETE_PRODUCT")
    Rel(create_service, product_store, "Appends put operation")
    Rel(get_service, product_store, "Reads product")
    Rel(list_service, product_store, "Reads products")
    Rel(update_service, product_store, "Appends patch operation")
    Rel(delete_service, product_store, "Appends delete operation")
    Rel(product_store, storage, "Uses storage root")
```

## C4 Deployment

```mermaid
C4Deployment
    title Deployment Diagram for mystore

    Deployment_Node(device, "iOS or Android device", "Mobile runtime") {
        Deployment_Node(native_app, "React Native app process", "Expo React Native") {
            Container(app, "Catalog UI", "React Native", "User-facing product catalog")
            Container(worklet, "Bare worklet", "react-native-bare-kit", "Runs bundled backend code")
        }

        Deployment_Node(storage_root, "App document storage", "Expo FileSystem document URI") {
            ContainerDb(product_files, "Product persistence files", "Corestore data", "Stores product feeds and Hyperbee view data")
        }
    }

    Rel(app, worklet, "Starts with app-owned storage path")
    Rel(app, worklet, "Sends product commands", "bare-rpc over IPC")
    Rel(worklet, product_files, "Reads and writes")
```

## Runtime Flow

The React Native app starts the Bare worklet with the bundled backend and passes the Expo document storage URI as the backend storage root. The app then opens a `bare-rpc` channel over the worklet IPC stream.

Product operations are sent as command codes. The backend decodes the request payload, routes the command to a service handler, and replies with a structured response. Product writes are appended as operations into Autobase, and Hyperbee provides the projected product view used by reads and list operations.
