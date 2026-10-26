/*
 * Where the land is, for the globe in the chain-agnostic section.
 *
 * Natural Earth 1:110m land (public domain, via the world-atlas package),
 * rasterized to a 1° grid: 180 rows from 90°N to 90°S, 360 columns from 180°W.
 * Each row is a run-length string, water first, rows separated by ".". A run
 * is one character of RUN_ALPHABET (0–63); longer runs are split by a run of
 * length 0.
 */

const RUN_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

const LAND_RUNS =
  "_0_0_0_0_0j._0_0_0_0_0j._0_0_0_0_0j._0_0_0_0_0j._0_0_0_0_0j._0_0_0_0_0j._0_0FC_0_0_0I._0V21LFP_0_0_0" +
  "D._0QP4d29_0_0_03._0L76D3pZ213M4f6_0J._0ML8lU824_057_0H._0435513341D2rW7_0I5_0C.z341G16A9oX441_0H2_0" +
  "C.w48273252A9n_0N4WB_05._71353221615Md_0E6RON8Z._032M611Pb_0D3RO_07.u8924415232213MZ_0C3OW1544D3b.t6" +
  "191335124931MX_0B4D48mA6Z.0185g41E53133G11HX_0B4C4121r31221DT.JAbB743KET21l7a61_0NK.HO4F3E3414545AD2" +
  "1RgFR4361_0V282.1Cr6371362567GOiME23A251_0g.4C_0D164229ALlR322P2_0g.513612_0G9C9ImK263S1_0i.0174_0I1" +
  "1B632ADH9QA3A5_0_0E.61813_0A244318EBJ7QA3B2_0_0F2.829_07522197EAoB2_0_0V1.F_0A824173H7nC3_0_0U111.E_" +
  "09G6N6mC4_0_0A23297.FH2qG8O3mD4_0_07799.I822AjH932_06D721_0w2453H.N3GjFA14w293267_0sI3I.M213IfGFu4C1" +
  "15511_0rH6H.K2QiBFu3B3145_0sI7H.H2Tk8Is4A2137_0qJ7I.F1Xn2Nm323A1631_0sJ5J.l13l3Nl3337_0_0811D4K.qk3N" +
  "l2362_0_0B11D2M.qm1M11p53_0_0B11E1M.q11_0331p24_0_0E12a.r21v324211q_0_0G22a.vs1366m_0_0J21b.u11v9111" +
  "o_0_0G31b.ux1121wX133C3_0M42a.u_yE1G322B5_0Lh.uu22_D3E993_0N61b.us-339342CC83_0L64Z.ur-C834AE65_0F94" +
  "a.ur-BA43945485_0Do.uo_02A725315212L3_0517B2c.uo_0298261333N4_033123C2c.vm_039L33M5_0173C1d.vl_048E2" +
  "624N4_02124393d.wk_0716AB162122_0M5375d.xj_0713DP_0L7248d.yh_07HQ_0L614312h.-d_08JO_0N94k._b_08O62C_" +
  "0N92m._21X_08Q47314_0O81n._0112W_08T1_0cx._0212H4262_08g1F2_09w._0311GD2_07j1D3_08w._0231EE3_04k3D4_" +
  "05x._0413CF211_01m2E7_y._0512CG1_02o2D117yz._0513A_0Ko2E33Aq21w._0A9_0Jq3K9n31x._0B8E113_q3LAL1N51x." +
  "_0C8I2ys2KBH5G12_06._0B973A2xr3JEE6E_0A.O1o954E3sr4HFC9C32_06._0D925E611os3GGBAC31_07._0GD_09t3DIABD" +
  "D2w._0IB_08u4AK9CEC2w._0O9_04v39M6IBB2w._0P9_03w26P6IBB2w._0R6_04x14S5IBD2u._0U4_03yW5I227F1t._0V2B1" +
  "ux62P4J136D121s._0V3741523kx16P4I153C1y._0X221341Al_02P311H161C161s._0X42Il_R121H2N111s._0a12Jk_U2H1" +
  "M113r._0eJlyV2I2E261t._0dPhA5ip3D3z._0ePi1Dgm232B5z._0eQzbo222A4_._0cSzaq22277-._0cTxas31159A1p._0bU" +
  "xYu4692441p._0bVwXw459E1l._0aasXx3672393k._0aa11rVy54723B124e._0bfoT-482311141312Ab._0ahnS_013G1D9Z." +
  "_0aklR_022G1B1382112S._0aklR_043P13A71O._0bjmQ_056P9B1L._0cimQ_0C122111131D332W._0chnR_0G141M2B2I._0" +
  "dgnR_0l1T._0eepQ_0T191b._0edpS81_0I651b._0fbqS81_0H662a._0fbpT72_0D21763Z._0gapS73_0BC63Z.0_0iYpS46_" +
  "0BE35L1B1._0kWpQ65_0AI15W11._0lUqO85_0AOY._0lUrM95_09QX._0lUrM95_06VF1F._0lTtL85_04YG1E._0lSuM75_03a" +
  "U._0lPxL94_03bT._0kO-K93_03dS._0kN_IC1_05dR._0kM_01I_0HeR._0kM_01I_0IdR._0kM_02G_0KdQ._0kL_04E_0LcR." +
  "_0jM_04E_0LcR._0jL_06C_0NbR._0kJ_07B_0OA8IS._0jJ_089_0P9B21DT._0jE13_0A2_0W3G11ET._0iG_0_0_06CN16._0" +
  "iG_0_0_08AO15._0hH_0_0_08AP14._0iE_0_0_0D112S32._0iB_0_0_0l33._0hC_0_0_0m23._0h9_0_0_0L3O2114._0hB_0" +
  "_0_0J3N36._0i8_0_0_0M1N37._0h9_0_0_0i39._0g8_0_0_0j49._0g8_0_0_0k2A._0g9_0_0_0v._0f9_0_0_0w._0f8_0_0" +
  "B1_0l._0g6_0_0_0y._0g683_0_0_0n._0h4_0_0_0z._0h6_0_0_0x._0j6_0_0_0v._0m1_0_0_0x._0_0_0_0_0j._0_0_0_0" +
  "_0j._0_0_0_0_0j._0_0_0_0_0j._0_0_0_0_0j._0_0_0_0_0j._0_0_0_0_0j._0w2_0_0_0m._0t1_0_0_0q._0r1_0_0_091" +
  "i._0o3_0q6i464F6i._0n3_0oCM_01Y._0n3_0jQA_08U._0j225_0W62U7_0IM._0j316_0542A2i5_0PJ._0g716o22_0C4_0a" +
  "9._0o6m_0_0w9.r222I53A435Cj_0_0xB.iA132711Acl_0_0uE.Y_0Ik_0_0vG.Y_0Dg_0_0_03G.M_0Kh_0_0_07G.G34_0GT5" +
  "8_0_0_0ED.I3A_09Q8D_0_0_02J.X_0B7668G_0_0_01K.P_0RO_0_0_0DJ.R_0V4_0_0_0UG.Q_0_0_0_0_08B.0517K_0_0_0_" +
  "0Yf.V1_0_0_0_0_0D._0_0_0_0_0j._0_0_0_0_0j._0_0_0_0_0j._0_0_0_0_0j";

let mask: Uint8Array | null = null;

function decode(): Uint8Array {
  const cells = new Uint8Array(360 * 180);
  LAND_RUNS.split(".").forEach((row, y) => {
    let x = 0;
    let land = 0;
    for (const symbol of row) {
      const run = RUN_ALPHABET.indexOf(symbol);
      if (land) cells.fill(1, y * 360 + x, y * 360 + x + run);
      x += run;
      land ^= 1;
    }
  });
  return cells;
}

/** Whether the point at this latitude and longitude (degrees) is on land. */
export function isLand(latitude: number, longitude: number): boolean {
  mask ??= decode();
  const y = Math.min(179, Math.max(0, Math.floor(90 - latitude)));
  const x = (((Math.floor(longitude + 180) % 360) + 360) % 360);
  return mask[y * 360 + x] === 1;
}
