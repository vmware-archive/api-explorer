import { TestBed, inject } from "@angular/core/testing";

import { ApixComponentsConfig } from "./config.component";

describe("ApixComponentsConfig", () => {
    let service: ApixComponentsConfig;
    beforeEach(() => {
        service = new ApixComponentsConfig();
    });

    it("should load config correctly", () => {
        expect(service.configFileUrl).toBeDefined();
    });
});
