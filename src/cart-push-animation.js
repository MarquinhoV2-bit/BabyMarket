// Animation-only data extracted from Tripo; the current BabyMarket baby mesh stays unchanged.
const PUSH_BONES = ["mixamorig:Hips","mixamorig:LeftUpLeg","mixamorig:LeftLeg","mixamorig:LeftFoot","mixamorig:RightUpLeg","mixamorig:RightLeg","mixamorig:RightFoot","mixamorig:Spine","mixamorig:Spine1","mixamorig:Spine2","mixamorig:LeftShoulder","mixamorig:LeftArm","mixamorig:LeftForeArm","mixamorig:LeftHand","mixamorig:Neck","mixamorig:Head","mixamorig:RightShoulder","mixamorig:RightArm","mixamorig:RightForeArm","mixamorig:RightHand"];
const PUSH_DATA = "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";
const PUSH_DURATION = 4;
const PUSH_FRAMES = 32;

export function createCartPushClip(THREE) {
  const binary = atob(PUSH_DATA);
  const packed = new Int8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    const value = binary.charCodeAt(i);
    packed[i] = value > 127 ? value - 256 : value;
  }
  const times = new Float32Array(PUSH_FRAMES);
  for (let i = 0; i < PUSH_FRAMES; i++) times[i] = i * PUSH_DURATION / (PUSH_FRAMES - 1);
  const tracks = [];
  let offset = 0;
  for (const boneName of PUSH_BONES) {
    const values = new Float32Array(PUSH_FRAMES * 4);
    for (let frame = 0; frame < PUSH_FRAMES; frame++) {
      let x = packed[offset++] / 127, y = packed[offset++] / 127;
      let z = packed[offset++] / 127, w = packed[offset++] / 127;
      const length = Math.hypot(x, y, z, w) || 1;
      x /= length; y /= length; z /= length; w /= length;
      const i = frame * 4;
      values[i] = x; values[i + 1] = y; values[i + 2] = z; values[i + 3] = w;
    }
    tracks.push(new THREE.QuaternionKeyframeTrack(boneName + ".quaternion", times, values));
  }
  return new THREE.AnimationClip("PushCart", PUSH_DURATION, tracks);
}
