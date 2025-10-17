package kh.BackendCapstone.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class ApiResponse {
	@JsonProperty("context")
	private List<Integer> context;
	
	@JsonProperty("created_at")
	private String createdAt;
	
	@JsonProperty("done")
	private boolean done;
	
	@JsonProperty("done_reason")
	private String doneReason;
	
	@JsonProperty("eval_count")
	private int evalCount;
	
	@JsonProperty("eval_duration")
	private long evalDuration;
	
	@JsonProperty("load_duration")
	private long loadDuration;
	
	@JsonProperty("model")
	private String model;
	
	@JsonProperty("prompt_eval_count")
	private int promptEvalCount;
	
	@JsonProperty("prompt_eval_duration")
	private long promptEvalDuration;
	
	@JsonProperty("response")
	private String response;
	
	@JsonProperty("total_duration")
	private long totalDuration;
	
	// Getters and Setters
	public List<Integer> getContext() {
		return context;
	}
	
	public void setContext(List<Integer> context) {
		this.context = context;
	}
	
	public String getCreatedAt() {
		return createdAt;
	}
	
	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}
	
	public boolean isDone() {
		return done;
	}
	
	public void setDone(boolean done) {
		this.done = done;
	}
	
	public String getDoneReason() {
		return doneReason;
	}
	
	public void setDoneReason(String doneReason) {
		this.doneReason = doneReason;
	}
	
	public int getEvalCount() {
		return evalCount;
	}
	
	public void setEvalCount(int evalCount) {
		this.evalCount = evalCount;
	}
	
	public long getEvalDuration() {
		return evalDuration;
	}
	
	public void setEvalDuration(long evalDuration) {
		this.evalDuration = evalDuration;
	}
	
	public long getLoadDuration() {
		return loadDuration;
	}
	
	public void setLoadDuration(long loadDuration) {
		this.loadDuration = loadDuration;
	}
	
	public String getModel() {
		return model;
	}
	
	public void setModel(String model) {
		this.model = model;
	}
	
	public int getPromptEvalCount() {
		return promptEvalCount;
	}
	
	public void setPromptEvalCount(int promptEvalCount) {
		this.promptEvalCount = promptEvalCount;
	}
	
	public long getPromptEvalDuration() {
		return promptEvalDuration;
	}
	
	public void setPromptEvalDuration(long promptEvalDuration) {
		this.promptEvalDuration = promptEvalDuration;
	}
	
	public String getResponse() {
		return response;
	}
	
	public void setResponse(String response) {
		this.response = response;
	}
	
	public long getTotalDuration() {
		return totalDuration;
	}
	
	public void setTotalDuration(long totalDuration) {
		this.totalDuration = totalDuration;
	}
}
