const request = require("supertest");
const MapModel = require("../../api/models/map.model");
const { MapStructure } = require("../../api/models/map-structure.model");
const TestDataManager = require("./factories/test-data-manager");
const mapsFactory = require("./factories/maps.factory");
const mapStructureFactory = require("./factories/map-structure.factory");
const app = "localhost:3000";

describe("Map execution tests", () => {
  const mapDataManager = new TestDataManager(MapModel);
  const mapStructureDataManager = new TestDataManager(MapStructure);
  let mapId;

  beforeEach(async () => {
    const map = mapsFactory.generateSimpleMap();
    await mapDataManager.generateInitialCollection(map);
    mapId = map._id;
  });

  // router.post("/:id/execute", mapController.execute);
  describe("POST /api/maps/:mapId/execute", () => {
    it(`should handle lack of map`, () => {
      const mapId = mapsFactory.generateSimpleMap()._id;
      return request(app)
        .post(`/api/maps/${mapId}/execute`)
        .expect(500)
        .then(({ text }) => {
          expect(text).toBe("Couldn't find map");
        });
    });

    it(`should handle lack of map structure`, () => {
      return request(app)
        .post(`/api/maps/${mapId}/execute`)
        .expect(500)
        .then(({ text }) => {
          expect(text).toBe("No structure found.");
        });
    });

    it(`should not execute an archived map`, async () => {
      await MapModel.findByIdAndUpdate(mapId, { archived: true });
      return request(app)
        .post(`/api/maps/${mapId}/execute`)
        .expect(500)
        .then(({ text }) => {
          expect(text).toBe("Can't execute archived map");
        });
    });

    it(`should handle no agents alive when trigger is 'started manually by user'`, async () => {
      await mapStructureDataManager.pushToCollectionAndSave(
        mapStructureFactory.generateOne(mapId)
      );
      return request(app)
        .post(`/api/maps/${mapId}/execute`)
        .send({ trigger: "Started manually by user" })
        .expect(500)
        .then(res => {
          expect(res.text).toBe("No agents alive");
        });
    });

    it(`should respond with new runId and current mapId`, async () => {
      await mapStructureDataManager.pushToCollectionAndSave(
        mapStructureFactory.generateOne(mapId)
      );
      return request(app)
        .post(`/api/maps/${mapId}/execute`)
        .expect(200)
        .then(({ body }) => {
          expect(body.runId).toBeDefined();
          expect(typeof body.runId).toBe("string");
          expect(body.runId.length > 0).toBe(true);
          expect(body.mapId).toBe(mapId);
        });
    });
  });

  // router.post("/:id/execute/:structure", mapController.execute);
  // NOTICE - THIS ROUTE IS NOT USED IN THE FRONTEND (KAH-37)
  describe("POST /api/maps/:mapId/execute/:structureId", () => {
    let structureId;

    beforeEach(async () => {
      const mapStructure = mapStructureFactory.generateOne(mapId);
      structureId = mapStructure._id;
      await mapStructureDataManager.pushToCollectionAndSave(mapStructure);
    });

    it(`should handle lack of map`, () => {
      const mapId = mapsFactory.generateSimpleMap()._id;
      const invalidStructureId = mapId;
      return request(app)
        .post(`/api/maps/${mapId}/execute/${invalidStructureId}`)
        .expect(500)
        .then(({ text }) => {
          expect(text).toBe("Couldn't find map");
        });
    });

    it(`should handle lack of map structure`, () => {
      const invalidStructureId = mapId;
      return request(app)
        .post(`/api/maps/${mapId}/execute/${invalidStructureId}`)
        .expect(500)
        .then(({ text }) => {
          expect(text).toBe("No structure found.");
        });
    });

    it(`should not execute an archived map`, async () => {
      await MapModel.findByIdAndUpdate(mapId, { archived: true });
      return request(app)
        .post(`/api/maps/${mapId}/execute/${structureId}`)
        .expect(500)
        .then(({ text }) => {
          expect(text).toBe("Can't execute archived map");
        });
    });

    it(`should handle no agents alive when trigger is 'started manually by user'`, () => {
      return request(app)
        .post(`/api/maps/${mapId}/execute/${structureId}`)
        .send({ trigger: "Started manually by user" })
        .expect(500)
        .then(res => {
          expect(res.text).toBe("No agents alive");
        });
    });

    it(`should respond with new runId and current mapId`, () => {
      return request(app)
        .post(`/api/maps/${mapId}/execute/${structureId}`)
        .expect(200)
        .then(({ body }) => {
          expect(body.runId).toBeDefined();
          expect(typeof body.runId).toBe("string");
          expect(body.runId.length > 0).toBe(true);
          expect(body.mapId).toBe(mapId);
        });
    });
  });

  // router.get("/:id/stop-execution", mapController.stopExecution);
  // NOTICE - THIS ROUTE IS NOT USED IN THE FRONTEND (KAH-38)
  describe("GET /api/maps/:mapId/stop-execution", () => {
    it(`should return {}`, () => {
      return request(app)
        .get(`/api/maps/${mapId}/stop-execution`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
  });

  // router.get("/:id/stop-execution/:runId", mapController.stopExecution);
  // NOTICE: does this route always return 200?
  describe("GET /api/maps/:mapId/stop-execution/:runId", () => {
    it(`should return {}`, () => {
      const random = Math.floor(Math.random() * 10 + 1);
      return request(app)
        .get(`/api/maps/${mapId}/stop-execution/${random}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
  });

  describe("POST /api/maps/:id/cancel-pending", () => {
    it(`should return with 500 staus code and proper error message`, () => {
      return request(app)
        .post(`/api/maps/0/cancel-pending`)
        .expect(500)
        .then(({ text }) => {
          expect(text).toEqual("Not enough parameters");
        });
    });
  });

  // router.get("/currentruns", mapController.currentRuns);
  // NOTICE: not able to test a case with existing current runs
  // because, the same as with pending executions, the ongoing executions are kept
  // in memory instead of the database
  describe("GET /api/maps/currentruns", () => {
    it(`should return {} for no current runs`, () => {
      return request(app)
        .get(`/api/maps/currentruns`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
  });
});
