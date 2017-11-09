### Installing APIX Components

1. Install APIX package through npm:
    ```
    npm install apix-components
    ```

2. Import the ApixComponentsModule into your Angular application's module.  Your application's main module might look like this:
    ```
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';
    import { ApixComponentsModule } from 'apix-components';
    import { AppComponent } from './app.component';

    @NgModule({
        imports: [
            BrowserModule,
            ApixComponentsModule,
            ....
         ],
         declarations: [ AppComponent ],
         bootstrap: [ AppComponent ]
    })
    export class AppModule {    }
    ```
