import { Mesh} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class GeometryMerger {
  static mergeMeshes(scene, options = {}) {
    
    let excludeObjects = options.excludeObjects || [];
    let excludeTypes = options.excludeTypes || [];
    
    function isInsideExcludedObject(mesh, excludeObjects) {
      let parent = mesh.parent;
      while (parent) {
        if (excludeObjects.includes(parent)) {
          return true;
        }
        parent = parent.parent;
      }
      return false;
    }
    
    let allMeshes = [];
    scene.traverse((obj) => {
      if (obj.isMesh) {
        if (isInsideExcludedObject(obj, excludeObjects)) {
          return;
        }
        
        let type = (obj.userData?.type || '').toLowerCase();
        let shouldSkipType = excludeTypes.some(exclude =>
          type.includes(exclude.toLowerCase())
        );
        
        if (!shouldSkipType) {
          allMeshes.push(obj);
        }
      }
    });
    
    
    let meshesByType = {
      wall: [],
      ground: [],
      ceiling: [],
      other: []
    };
    
    allMeshes.forEach(mesh => {
      let type = mesh.userData?.type || 'other';
      if (meshesByType[type]) {
        meshesByType[type].push(mesh);
      } else {
        meshesByType.other.push(mesh);
      }
    });
        
    Object.entries(meshesByType).forEach(([type, meshes]) => {
      if (meshes.length < 2) {
        return;
      }
      
      
      try {
        let firstMesh = meshes[0];
        
        let isMultiMaterial = Array.isArray(firstMesh.material); // deals with our walls floor
        
        if (isMultiMaterial) {
          let singleMaterial = firstMesh.material[0];
          
          let geometries = meshes.map(mesh => {
            let geo = mesh.geometry.clone();
            mesh.updateMatrixWorld(true);
            geo.applyMatrix4(mesh.matrixWorld);
            return geo;
          });
          
          let mergedGeometry = mergeGeometries(geometries, false);
          mergedGeometry.computeVertexNormals();
          mergedGeometry.computeBoundingSphere();
          mergedGeometry.computeBoundingBox();
          
          let mergedMesh = new Mesh(mergedGeometry, singleMaterial);
          mergedMesh.name = `merged_${type}`;
          mergedMesh.userData.merged = true;
          mergedMesh.userData.type = type;
          mergedMesh.frustumCulled = false;
          mergedMesh.castShadow = firstMesh.castShadow;
          mergedMesh.receiveShadow = firstMesh.receiveShadow;
          
          scene.add(mergedMesh);
          
        } else {
          let geometries = meshes.map(mesh => {
            let geo = mesh.geometry.clone();
            mesh.updateMatrixWorld(true);
            geo.applyMatrix4(mesh.matrixWorld);
            return geo;
          });
          
          let mergedGeometry = mergeGeometries(geometries, false);
          mergedGeometry.computeVertexNormals();
          mergedGeometry.computeBoundingSphere();
          mergedGeometry.computeBoundingBox();
          
          let mergedMesh = new Mesh(mergedGeometry, firstMesh.material);
          mergedMesh.name = `merged_${type}`;
          mergedMesh.userData.merged = true;
          mergedMesh.userData.type = type;
          mergedMesh.frustumCulled = false;
          mergedMesh.castShadow = firstMesh.castShadow;
          mergedMesh.receiveShadow = firstMesh.receiveShadow;
          
          scene.add(mergedMesh);
        }
        
        // Remove originals
        meshes.forEach(mesh => {
          if (mesh.parent) {
            mesh.parent.remove(mesh);
          }
        });
        
        
      } catch (error) {
        console.error(`❌ Error merging ${type}:`, error);
        console.error(error.stack);
      }
    });
    
  }
}

/**
 * USAGE:
 * 
 * import { MultiMaterialGeometryMerger } from './multi-material-geometry-merger.js';
 * 
 * MultiMaterialGeometryMerger.mergeMeshes(this.scene, {
 *   excludeObjects: [this.playerModel, this.armTorchModel, this.camera],
 *   excludeTypes: ['endBlock']
 * });
 */