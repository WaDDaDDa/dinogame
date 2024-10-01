import { getStage, setStage } from "../models/stage.model.js";
import { getGameAssets } from "../init/assets.js";

export const moveStageHandler = (userId, payload) => {
  // 유저의 현재 스테이지 배열을 가져오고, 최대 스테이지 ID를 찾는다.
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: "fail", message: "No stages found for user" };
  }

  // 오름차순 정렬 후 가장 큰 스테이지 ID 확인 = 가장 상위의 스테이지 = 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // payload 의 currentStage 와 비교
  // id랑 스테이지랑 비교?
  // 클라이언트 vs 서버 비교
  if (currentStage.id !== payload.currentStage) {
    return { status: "fail", message: "Current stage mismatch" };
  }

  // 점수 검증
  const serverTime = Data.now(); // 현재 시간
  const elapsedTime = (serverTime - currentStage.timestamp) / 1000; // 1초단위 계산

  // 1초당 1점, 100점 이상 다음스테이지 이동 , 오차 범위 5
  // 클라이언트와 서버 간의 통신 지연시간을 고려해서 오차 범위 설정
  // elapsedTime 은 100 이상 105 이하 일 경우에만 통과
  // 1스테이지 -> 2스테이지로 넘어가는 가정.
  if (elapsedTime < currentStages.score || elapsedTime > currentStages.score + 5) {
    return { status: "fail", message: "Invalud elapsed time" };
  }

  // 게임 에셋에서 다음 스테이지의 존재 여부 확인
  const { stages } = getGameAssets();
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: "fail", message: "Target stage not found" };
  }

  // 유저의 스테이지 정보 업데이트
  setStage(userId, payload.targetStage, serverTime);
  return { status: "success" };
};